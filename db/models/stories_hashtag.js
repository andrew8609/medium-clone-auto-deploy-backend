'use strict';
module.exports = (sequelize, DataTypes) => {
  var Stories_hashtag = sequelize.define("Stories_hashtag", {
    hashtag_id: DataTypes.INTEGER(5),
    story_id: DataTypes.STRING(50),
}, {
    underscored: true,
    tableName: 'stories_hashtags',
    timestamps: true
  }
);
  Stories_hashtag.associate = function(models) {
    // associations can be defined here
    Stories_hashtag.belongsTo(models.Hashtag, {
      foreignKey: 'hashtag_id',
      target: 'id'
    }),
    Stories_hashtag.belongsTo(models.Story, {
      foreignKey: 'story_id',
      target: 'id'
    })
  };
  return Stories_hashtag;
};