'use strict';
module.exports = (sequelize, DataTypes) => {
  var Story = sequelize.define("Story", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
      },
    title: DataTypes.STRING(100),
    content: DataTypes.BLOB, 
    content_pure: DataTypes.BLOB, 
    clap_number: DataTypes.INTEGER(5),
    hashtag: DataTypes.STRING(45)
}, {
    underscored: true,
    tableName: 'stories',
    timestamps: true
  }
);
  Story.associate = function(models) {
    // associations can be defined here
    Story.belongsTo(models.User, {
      foreignKey: 'user_id',
      target: 'id'
    });
    Story.hasMany(models.Comment, {
        foreignKey: 'story_id',
        target: 'id'
    });
    Story.hasMany(models.Clap, {
      foreignKey: 'story_id',
      targetKey: 'id'
    });
    Story.hasMany(models.Stories_hashtag, {
      foreignKey: 'story_id',
      targetKey: 'id'
    })
  };
  return Story;
};