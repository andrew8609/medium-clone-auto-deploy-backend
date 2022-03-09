'use strict';
module.exports = (sequelize, DataTypes) => {
  var Hashtag = sequelize.define("Hashtag", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    hashtag_name: DataTypes.STRING(50),
    used_number: DataTypes.INTEGER(5),
}, {
    underscored: true,
    tableName: 'hashtags',
    timestamps: true
  }
);
  Hashtag.associate = function(models) {
    // associations can be defined here
    Hashtag.hasMany(models.Stories_hashtag, {
      foreignKey: 'hashtag_id',
      target: 'id'
    })
  };
  return Hashtag;
};