'use strict';

const { useColors } = require("debug/src/browser");
const config = require("../../config/auth.config");
const {v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    username: DataTypes.STRING(100),
    email: DataTypes.STRING(50),
    photo_url: DataTypes.STRING(255),
    bio_note: DataTypes.STRING(255),
    is_activated: DataTypes.BOOLEAN

  }, {
    underscored: true,
    tableName: 'users',
    timestamps: true
  });
  
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Comment,{
      foreignKey: 'user_id',
      as: 'comments'
    });
    User.hasOne(models.RefreshToken,{
      foreignKey: 'user_id',
      targetKey: 'id'
    });
    User.hasMany(models.Story,{
      foreignKey: 'user_id',
      targetKey: 'id'
    });
    User.hasMany(models.Follow, { 
      foreignKey: 'follower_id',
      
    },{
      foreignKey: 'followed_id',
      
    }),
    User.hasMany(models.Clap, {
      foreignKey: 'user_id',
      targetKey: 'id'
    })
  };

  return User;
};