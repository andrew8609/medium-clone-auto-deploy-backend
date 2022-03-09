'use strict';
module.exports = (sequelize, DataTypes) => {
  var Comment = sequelize.define("Comment", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
      },
    content: DataTypes.STRING(100),
    parent_id: DataTypes.STRING(50),
    depth: DataTypes.INTEGER(3)
}, {
    underscored: true,
    tableName: 'comments',
    timestamps: true
  }
);
  Comment.associate = function(models) {
    // associations can be defined here
    Comment.belongsTo(models.User, {
      foreignKey: 'user_id',
      target: 'id'
    });
    Comment.belongsTo(models.Story, {
      foreignKey: 'story_id',
      target: 'id'
    })
  };
  return Comment;
};