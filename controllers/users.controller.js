const jwt = require('jsonwebtoken');

const User = require('../db/models').User;
const Comment = require('../db/models').Comment;
const Story = require('../db/models').Story;
const Follow = require('../db/models').Follow;
const RefreshToken = require('../db/models').RefreshToken;
const config = require("../config/auth.config");
const ResponseFormat = require('../core').ResponseFormat;
const SendEmail = require('../core').SendEmail;
const Pagination = require('../core').Pagination;
const crypto = require("crypto");
const imgbbUploader = require("imgbb-uploader");


module.exports = {

    async getMyProfile(req, res) {
        await User
            .findOne({ 
                where: { id: req.userId }
            })
            .then( user => {
               // console.log(user);
                res.status(200).send({
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    photo_url: user.photo_url,
                    bio_note: user.bio_note,
                  });  
            })
            .catch( error => {
                console.log(error);
            });
    },

    async updateMyProfile(req, res) {    
        await User
            .findById(req.userId)
            .then(usr => {
                if(!usr) {
                    return res.status(404).json({ message: "user not found"});
                }

                
                username = req.body.username || usr.username;
                email =  req.body.email || usr.email;
                photo_url = req.file.path? req.file.path : usr.photo_url;
                bio_note = req.body.bio_note || usr.bio_note;

                return usr
                .update({
                    username: username,
                    email:  email,
                    photo_url: photo_url,
                    bio_note: bio_note
                })
                .then(() => res.status(200).json({  username: username,
                                                    email:  email,
                                                    photo_url: photo_url,
                                                    bio_note: bio_note }))
                .catch((error) => res.status(500).json({message: "something went wrong when update the user"}));
            });

    },

    async deleteMyProfile(req, res) {
        await User
        .findById(req.userId)
        .then(usr => {
            if(!usr) {
                return res.status(404).json({message: "user not found"});
            }
            return usr
            .destroy()
            .then(() => res.status(200).json( {message: "user deleted successfully"}))
            .catch(error => res.status(500).json({ message: error} ));
        });
    },

    async getPublicProfile(req, res) {
        await User
        .findById(req.params.userId)
        .then( usr => {
            if(!usr) {
                return res.status(404).json({message: "user not found"});
            }
            return res.status(200).json({
                id: usr.id,
                photo_url: usr.photo_url,
                bio_note: usr.bio_note
            })
        })
    },

    async getUserProfile(req, res) {
       
        await User.findOne({
            where: {
                id: req.params.userId
            },
            include: [{
                model: Story,
                attributes: ["id", "title", "content", "content_pure", "hashtag", "created_at"]
            }],
            order: [[
                'created_at', 'DESC'
            ]]
        }).then(data => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(500).send(err)
        });
    },

    async getUserFollows(req, res) {
        await Follow.findAll({
            where: {
                follower_id: req.userId
            }
        })
        .then(async (records)=>{
            var followers = [];
            for (let index = 0; index < records.length; index++) {
                await User.findOne({
                    where: {
                        id: records[index].followed_id
                    },
                    attributes: ['photo_url', 'id'],
                    order: [[
                        'created_at', 'ASC'
                    ]]
                })
                .then((follow)=>{
                    followers.push(follow);
                })
                .catch(err => {
                    res.status(500).send({message: err.message || "some error occured in getting followers."})
                })
            }
            res.status(200).json(followers);
        })
        .catch(err => {
            res.status(500).send({message: err.message || "some error occured in getting followers."})
        })
        
    },
    async checkMeFollowing(req, res) {
        await Follow.findAll({
                where: {
                    follower_id: req.userId,
                    followed_id: req.query.AuthorId
                }
            })
            .then(follow => {
                if (!follow) {
                    return res.status(200).send("not following");
                } else {
                    return res.status(400).send(" following");
                }
                
            })
            .catch(err => {
                res.status(500).send({message: err.message || "some error occured in getting followers."})
            })
    },
    

    async getUserComments(req, res) {
       
        await Comment.findAll({
                where: {
                    user_id: req.params.userId
                },
                attributes: [
                    'story_id', 'content', 'parent_id', 'sequence'
                ],
                order: [[
                    'created_at', 'DESC'
                ]]
            })
            .then(follow => {
                return res.status(200).json(follow);
            })
            .catch(err => {
                res.status(500).send({message: err.message || "some error occured in getting followers."})
            })
    },

    async getUserFollowers(req, res) {
       
        await Follow.findAll({
                where: {
                    follower_id: req.params.userId
                },
                order: [[
                    'created_at', 'DESC'
                ]]
            })
            .then(async followerRecords => {
                var followers = [];
                for (let index = 0; index < followerRecords.length; index++) {
                    await User.findOne({
                        where: {
                            id: followerRecords[index].followed_id
                        }
                    })
                    .then((record) => {
                        followers.push(record);
                    })
                }
                
                return res.status(200).json(followers);
            })
            .catch(err => {
                res.status(500).send({message: err.message || "some error occured in getting followers."})
            })
    },

    

    async postUserFollows(req, res) {
        
        await Follow.findOrCreate({
            where: {
                follower_id: req.userId,
                followed_id: req.body.followed_id
            }, defaults: {
                follower_id: req.userId,
                followed_id: req.body.followed_id
            }
        })
        .then( follow => {
            return res.status(200).json({message: 'succeeded in following.'});
        })
        .catch( err => {
            return res.status(400).json({message: 'failed in following' + err});
        })
    },

    async deleteUserFollows(req, res) {

        await Follow.destroy({
            where: {
                follower_id: req.userId,
                followed_id: req.query.followed_id
            }
        })
        .then( () => {
            return res.status(200).json({message: "succeeded in cancelling following."});
        })
        .catch( err => {
            return res.status(400).json({message: "failed in cancelling"});
        });
    },

    

    create(req, res) {
        return user
        .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        })
        .then(user => res.status(201).json(ResponseFormat.build(
            user,
            "User Create Successfully",
            201,
            "success"
        )))
        .catch(error => res.status(400).json(ResponseFormat.error(
            error,
            "Something went wrong when create Users",
            "error"
        )))
    },
    list(req, res) {
        return user
        .findAll()
        .then(users => res.status(200).json(ResponseFormat.build(
            users,
            "User Information Reterive successfully",
            200,
            "success"
        )))
        .catch(error => res.status(400).send(ResponseFormat.build(
            error,
            "Somthing went wrong when Reterieve Information",
            400,
            "error"
        )));
    },
    listWithComment(req, res) {
        return user
        .findAll({
            include: [{
                model: comment,
                as: 'comments'
            }],
            order:[
             ['createdAt', 'DESC'],
             [{model: comment, as:'comments'}, 'createdAt', 'ASC'],
            ],
        })
        .then((users) => res.status(200).json(
            ResponseFormat.build(
                users,
                "all user information are reterive successfully",
                200,
                "success"
            )
        ))
        .catch((error) => res.status(500).json(
            ResponseFormat.error(
                error,
                "somthing went wrong when reterieve the data",
                500,
                "error"
            )
        ))
    },
    getUserDetails (req, res) {
        return user
        .findById(req.params.userId, {
            include: [{
                model: comment,
                as: 'comments'
            }],
        })
        .then(users => {

            if(!users) {
                return res.status(404).json(
                    ResponseFormat.build(
                        {},
                        "No user found",
                        404,
                        "error"
                    )
                )
            }

            return res.status(200).json(
                ResponseFormat.build(
                    users,
                    "User information reterieve successfully",
                    200,
                    "success"
                )
            )
        })
        .catch(error => res.status(500).json(
            ResponseFormat.error(
                error,
                "Something went wrong when reterive the user details",
                500,
                "error"
            )
        ));
    },
    update(req, res) {
        return user
        .findById(req.params.userId)
        .then(usr => {
            if(!usr) {
                return res.status(404).json(
                    ResponseFormat.error(
                        {},
                        "User not found",
                        404,
                        "error"
                    )
                );
            }

            return usr
            .update({
                firstName: req.body.firstName || usr.firstName,
                lastName: req.body.lastName || usr.lastName,
                email:  req.body.email || usr.email
            })
            .then(() => res.status(200).json(
                ResponseFormat.build(
                    usr,
                    "user Update successfully",
                    200,
                    "success"
                )
            ))
            .catch((error) => res.status(500).json(
                ResponseFormat.build(
                    {},
                    "someting went wrong when update the user",
                    500,
                    "error"
                )
            ));
        });
    },
    destroy (req, res) {
        return user
        .findById(req.params.userId)
        .then(usr => {
            if(!usr) {
                return res.status(404).json(
                    ResponseFormat.error(
                        {},
                        "user not found",
                        404,
                        "error"
                    )
                );
            }

            return usr
            .destroy()
            .then(() => res.status(200).json(
               ResponseFormat.build(
                 {},
                 "user deleted successfully",
                 200,
                 "success"
               )
            ))
            .catch(error => res.status(500).json(
                ResponseFormat.error(
                    error,
                    "someting went wrong when delete the user",
                    500,
                    "error"
                )
            ));
        });
    }
}