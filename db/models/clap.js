'use strict';
module.exports = (sequelize, DataTypes) => {
  var Clap = sequelize.define("Clap", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    clap_number: DataTypes.INTEGER,
}, {
    underscored: true,
    tableName: 'claps',
    timestamps: true
  }
);
  Clap.associate = function(models) {
    // associations can be defined here
    Clap.belongsTo(models.User, {
      foreignKey: 'user_id',
      target: 'id'
    });
    Clap.belongsTo(models.Story, {
      foreignKey: 'story_id',
      target: 'id'
    })
  };
  return Clap;
};