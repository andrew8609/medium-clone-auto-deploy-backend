const config = require("../../config/auth.config");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define("RefreshToken", {
        refresh_token: DataTypes.STRING,
        expiry_date: DataTypes.INTEGER(14),
    }, {
        underscored: true,
        tableName: 'refresh_tokens',
        timestamps: true
      }
    );

  RefreshToken.associate = function(models) {
    // associations can be defined here
    RefreshToken.belongsTo(models.User,{
      foreignKey: 'user_id',
      targetKey: 'id'
    });
  };

  RefreshToken.createToken = function (user) {
    let expiredAt = new Date();

    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

    let _token = uuidv4();

    let refreshToken = this.create({
      refresh_token: _token,
      user_id: user.id,
      expiry_date: expiredAt.getTime() / 1000,
    });

    return _token;
  };

  RefreshToken.verifyExpiration = (token) => {
    console.log("inside verify expiration " + token.expiry_date + " " + new Date().getTime());
    return token.expiry_date < new Date().getTime() / 1000;
  };

  return RefreshToken;
};
