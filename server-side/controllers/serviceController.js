const Service = require('../models/Service');

exports.createService = async (req, res) => {
    try {
        const { title, category, description, priceEstimate } = req.body;
        const service = await Service.create({
            provider: req.user.id,
            title,
            category,
            description,
            priceEstimate
        });
        res.status(201).json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.searchServices = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        if (category) filter.category = category;

        const services = await Service.find(filter)
            .populate('provider', 'name trustScore category phone location');

        // Sort by provider trust score, highest first
        const sorted = services.sort(
            (a, b) => (b.provider?.trustScore || 0) - (a.provider?.trustScore || 0)
        );

        res.json(sorted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('provider', 'name trustScore category phone location bio');
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};