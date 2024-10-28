const checkPermissions = (requiredPermissionsBits) => {
    return (req, res, next) => {

        if (!req.user || typeof req.user.permissions === 'undefined') {
            return res.status(404).send('Page non trouvée');
        }

        const hasPermission = requiredPermissionsBits.some(permissionBit =>
            (req.user.permissions & (1 << permissionBit)) !== 0
        );

        if (hasPermission) {
            next(); // Permission accordée, accès autorisé
        } else {
            res.status(404).send('Page non trouvée'); // Permission refusée, retourne une erreur 404
        }
    };
};

module.exports = checkPermissions;
