export default (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.STRING
  }, {
    classMethods: {
      /**
       * @function associate
       *
       * @param {Object} models - Sequelize Models
       *
       * @returns {void}
       */
      associate(models) {
        // associations can be defined here
        Role.hasMany(models.User, {
          foreignKey: 'roleId',
        });

        Role.belongsToMany(models.Document, {
          through: 'DocumentRole',
          foreignKey: 'roleId'
        });
      }
    }
  });
  return Role;
};
