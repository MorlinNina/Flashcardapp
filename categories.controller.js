module.exports = (categoriesRepository) => {
    const DashboardController = {
        getAll: async function(req, res, next) {
            const userId = req.userData.id;
            // Aktuell werden alle Kategorien ausgegeben
            const categories = await categoriesRepository.getAll();
            return res.status(201).json(categories);
        }
    }

    return DashboardController;
} 