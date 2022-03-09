'use strict';
module.exports = (sequelize, DataTypes) => {
  var Follow = sequelize.define("Follow", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    follower_id: DataTypes.STRING(50),
    followed_id: DataTypes.STRING(50),
}, {
    underscored: true,
    tableName: 'follows',
    timestamps: true
  }
);
  Follow.associate = function(models) {
    // associations can be defined here
    Follow.belongsTo(models.User, {

      foreignKey: 'follower_id',
      
    },
    {
      foreignKey: 'followed_id',
       
    })
  };
  return Follow;
};