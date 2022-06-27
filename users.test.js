const getUsersController = require('../users.controller.js');
const bcrypt = require('bcryptjs');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.status().send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockRequest = (body) => {
    return {
        body: body
    };
};

const mockedRegisterReq = mockRequest({
    username: 'testuser',
    password: 'testpwd',
    repeat: 'testpwd',
    currencyid: 1,
    email: 'test@test.com'
});

const mockedNext = jest.fn();

var mockUser;
beforeAll(async() => {
    mockUser = {
        "id": "65695525-d9d8-4d62-a986-d9cf688c108b",
        "username": "testuser",
        "email": "test@test.test",
        "password": await bcrypt.hash("123456", 10),
        "currencyid": 1,
        "registered": "2022-04-22T21:10:01.000Z",
        "last_login": "2022-04-30T15:05:21.000Z",
        "currency": {
            "short": "$",
            "id": 1,
            "identifier": "usd"
        }
    }  
});

describe('user register test', () => {
    test('successful registration', async() => {
        findUserIdByUsername = jest.fn(async() => []);
        createUser = jest.fn()
        const mockedRes = mockResponse();

        const usersController = getUsersController({
            findUserIdByUsername,
            createUser,
        });

        return await usersController.register(mockedRegisterReq, mockedRes, mockedNext).then(data => {
            const expectedMessage = { 
                message: 'registered' 
            };

            expect(mockedRes.status().send).toHaveBeenCalledWith(expectedMessage);
            expect(mockedRes.status).toHaveBeenCalledWith(201);

            expect(findUserIdByUsername.mock.calls.length).toBe(1);
            expect(createUser.mock.calls.length).toBe(1);
        });
    })

    test('duplicate registration',async() => {
        findUserIdByUsername = jest.fn(async() => mockUser);

        createUser = jest.fn()
        const mockedRes = mockResponse();

        const usersController = getUsersController({
            findUserIdByUsername,
            createUser,
        });

        return await usersController.register(mockedRegisterReq, mockedRes, mockedNext).then(data => {
            const expectedMessage = { 
                message: 'Dieser Username ist bereits vergeben!' 
            };

            expect(mockedRes.status().send).toHaveBeenCalledWith(expectedMessage);
            expect(mockedRes.status).toHaveBeenCalledWith(409);

            expect(findUserIdByUsername.mock.calls.length).toBe(1);
            expect(createUser.mock.calls.length).toBe(0);
        });
    })
})

describe('user login test', () => {
    test('successful login', async() => {
        findUserByUsername = jest.fn(async() => mockUser);

        getCurrency = jest.fn(async(userId) => [{
            "id": 1,
            "name":"test currency"
        }]);

        const usersController = getUsersController({
            findUserByUsername,
            getCurrency
        });

        const mockedReq = mockRequest({
            username: 'testuser',
            password: '123456',
        });
        const mockedRes = mockResponse();
        return await usersController.login(mockedReq, mockedRes, mockedNext).then(data => {
            expect(mockedRes.status).toHaveBeenCalledWith(201);
            expect(findUserByUsername.mock.calls.length).toBe(1);
        });
    })

    test('wrong password login', async() => {
        findUserByUsername = jest.fn(async() => mockUser);
        getCurrency = jest.fn(async(userId) => []);

        const usersController = getUsersController({
            findUserByUsername,
            getCurrency
        });

        const mockedReq = mockRequest({
            username: 'testuser',
            password: 'false_password',
        });
        const mockedRes = mockResponse();
        

        return await usersController.login(mockedReq, mockedRes, mockedNext).then(data => {
            const expectedMessage = { 
                message: 'Username oder Passwort falsch!' 
            };

            expect(mockedRes.status().send).toHaveBeenCalledWith(expectedMessage);
            expect(mockedRes.status).toHaveBeenCalledWith(400);

            expect(findUserByUsername.mock.calls.length).toBe(1);
        });
    })

    test('user not found login', async() => {
        findUserByUsername = jest.fn(async() => {});

        const usersController = getUsersController({
            findUserByUsername,
        });

        const mockedReq = mockRequest({
            username: 'testuser',
            password: '123456',
        });
        const mockedRes = mockResponse();
        

        return await usersController.login(mockedReq, mockedRes, mockedNext).then(data => {
            const expectedMessage = { 
                message: 'Username oder Passwort falsch!' 
            };

            expect(mockedRes.status().send).toHaveBeenCalledWith(expectedMessage);
            expect(mockedRes.status).toHaveBeenCalledWith(400);

            expect(findUserByUsername.mock.calls.length).toBe(1);
        });
    })

})