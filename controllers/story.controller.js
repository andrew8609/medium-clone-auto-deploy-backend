const jwt = require('jsonwebtoken');

const User = require('../db/models').User;
const Comment = require('../db/models').Comment;
const Story = require('../db/models').Story;
const Follow = require('../db/models').Follow;
const Hashtag = require('../db/models').Hashtag;
const Stories_hashtag = require('../db/models').Stories_hashtag;
const Clap = require('../db/models').Clap;
const Pagination = require('../core').Pagination;
const crypto = require("crypto");
const Sequelize = require("sequelize");

module.exports = {
    async postNewStory(req, res) {
        const newRandomId = crypto.randomBytes(10).toString('hex');
        await Story.create({
            id: newRandomId,
            user_id: req.userId,
            title: req.body.story.title,
            content: req.body.story.content,
            content_pure: req.body.story.content_pure
        });
        const hashtags = req.body.story.hashtag;
        for (let index = 0; index < hashtags.length; index++) {
            await Hashtag.findOne({
                where: {
                    hashtag_name: hashtags[index]
                }
            })
            .then(async(record) => {
                if(record != null) {
                    //await Hashtag.update({used_number: Sequelize.literal('used_number+1')}, {where: {hashtag_name: hashtags[index]}})
   
                    await Stories_hashtag.create({
                        hashtag_id: record.id,
                        story_id: newRandomId
                    })
                } else {
                    await Hashtag.create({
                        hashtag_name: hashtags[index],
                        used_number: 1
                    })
                    .then(async newRecord=>{
                            await Stories_hashtag.create({
                                hashtag_id: newRecord.id,
                                story_id: newRandomId
                            })
                        }
                    )
                }
            })
        }
        return res.status(200).json({
            data: {
                id: req.body.story.id,
                title: req.body.story.title,
                content: req.body.story.content,
                hashtag: req.body.story.hashtag
            }}
        );  
    },

    async updateStory(req, res) {
        
        await Story.update({
            title: req.body.story.title,
            content: req.body.story.content,
            content_pure: req.body.story.content_pure
        }, {
            where: {id: req.params.storyId},
        });
        const hashtags = req.body.story.hashtag;
        await Stories_hashtag.destroy({where:{story_id: req.body.story.id}});
        for (let index = 0; index < hashtags.length; index++) {
            await Hashtag.findOne({
                where: {
                    hashtag_name: hashtags[index]
                }
            })
            .then(async(record) => {
                if(record != null) {
                    await Hashtag.update({used_number: Sequelize.literal('used_number+1')}, {where: {hashtag_name: hashtags[index]}})
                    await Stories_hashtag.create({
                        hashtag_id: record.id,
                        story_id: req.body.story.id
                    })

                } else {
                    await Hashtag.create({
                        hashtag_name: hashtags[index],
                    })
                    .then(async newRecord=>{
                            await Stories_hashtag.create({
                                hashtag_id: newRecord.id,
                                story_id: req.body.story.id
                            })
                        }
                    )
                }
            })
            
        }
        return res.status(200).json({
            data: {
                id: req.body.story.id,
                title: req.body.story.title,
                content: req.body.story.content,
                hashtag: req.body.story.hashtag
            }}
        );
    },
    
    async deleteStory(req, res) {
        await Story.findOne({
            where: {
                id: req.params.storyId
            }
        })
        .then( story => {
            if(story.user_id != req.userId){
                return res.status(400).json({message: "user can not delete other's publication"});
            } else {
                story.destroy()
                .then(() => {
                    return res.status(200).json({
                        message: "succeeded in deleting story."});
                    })
                .catch( err => {
                    res.status(400).json({message: 'error in deleting story'});
                });
            }
        })
        .catch( err => {
            return res.status(500).json({ message: 'error in deleting'})
        });
    },

    async getStories(req, res) {
        var { page, size, type } = req.query;
        
        const { limit, offset } = Pagination.getPagination(page, size);
        if(type=="all") {
            await Story.findAndCountAll({ 
                attributes: ['id', 'title', 'content', 'content_pure','created_at'],
                include: [{
                    model: User,
                    attributes: ['id', 'photo_url', 'bio_note', 'username']
                }],
                order:[
                    ['clap_number', 'DESC']
                ],
                limit, offset 
            })
            .then(data => {
            const response = Pagination.getStoryPagingData(data, page, limit);
            res.status(200).send(response);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                    err.message || "Some error occurred while retrieving tutorials."
                });
            });
        } else if (type=="mine") {

            var condition = {user_id: req.userId}

            await Story.findAndCountAll({ 
                where: condition, 
                attributes: ['id', 'title', 'content_pure', 'created_at'],
                order: [
                    ['clap_number', 'DESC']
                ],
                limit, offset })
                .then(data => {
                const response = Pagination.getStoryPagingData(data, page, limit);
                res.status(200).send(response);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                        err.message || "Some error occurred while retrieving tutorials."
                    });
                });
        }
    },
    async getHashtagStories(req, res) {
        
        await Hashtag.findOne({
            where: {
                id: req.params.hashtagId
            }
        })
        .then(async hashtagRecord => {
            await Stories_hashtag.findAll({
                where: {
                    hashtag_id: req.params.hashtagId
                },
                include: [{
                    model: Story,
                }],
                
            })
            .then( (records) => {
                res.status(200).send({stories: records, hashtag_name: hashtagRecord.hashtag_name});    
            })
            .catch(err=>{
                res.status(500).send(err);
            });
        })
        
        
      
    },
    getStory(req, res) {

         Story.findOne({ 
                where: {
                    id: req.params.storyId
                }, 
                include: [{
                    model: User,
                    as: "User",
                    attributes: [ 'id', 'username', 'photo_url']
                },
                {
                    model: Clap,
                    attributes: ['clap_number'],
                    required: false
                }]
            })
            .then(async story => {
                await Follow.findAll({
                    where: {
                        follower_id: req.userId,
                        followed_id: story.User.id
                    }
                })
                .then(follow => {
                    if (!follow.length) {
                        return res.status(200).send({story, ...{isFollowing: false}});
                    } else {
                        return res.status(200).send({story, ...{isFollowing: true}});
                    }     
                })
                .catch(err => {
                    res.status(500).send({message: err.message || "some error occured in getting followers."})
                })
            })
            .catch(err => {
                res.status(500).send({
                    message:
                    err.message || "Some error occurred while retrieving tutorials."
                });
            });
    },

getStoryComment(req, res) {

        let result = {comments:[]};
        Comment.findAll({
            where: {
                story_id: req.params.storyId,
                depth: 0
            },
            include: [{
                model: User,
                attributes: ['id', 'photo_url', 'bio_note', 'username']
            }],
            order: [['created_at', 'ASC']]
        }).then(async (comments) => {
            if(comments != null) {
                
                for (let i = 0; i < comments.length; i++) {       

                    result['comments'].push(comments[i].toJSON());
                    await Comment.findAll({
                        where: { 
                            parent_id: comments[i].id 
                        },
                        include: [{
                            model: User,
                            attributes: ['id', 'photo_url', 'bio_note', 'username']
                        }],
                        order: [['created_at', 'ASC']]
                    }).then((childComments) => {
                        if (childComments != null) {
                            result['comments'][i].children = [];
                            for (let index = 0; index < childComments.length; index++) { 
                                result['comments'][i]['children'].push(childComments[index].toJSON());
                                
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                }
                res.status(200).send(result);
                   // })
            }
           
        }).catch((err)=>{
            console.log(err);
            //return res.status(500).json({error: "something went wrong" +err });
        })

    },
    async putStoryComment(req, res) {
       
        await Comment.update({
                content: req.body.content,
            }, {
                where: {id: req.body.id},
            })
            .then(() => {
                return res.status(200).json({message: "updated succeessfully."});
                })
            .catch( err => {
                res.status(400).json({message: 'error in updating story'});
            });

    },
    async postStoryComment(req, res) {
       console.log("comment: " + JSON.stringify(req.body, null, 2))
        await Comment.create({
            user_id: req.userId,
            story_id: req.body.story_id,
            content: req.body.content,
            parent_id: req.body.parent_id,
            depth: req.body.depth
        })
        .then(() => {
                res.status(200).json({message: "succeeded in posting new comment"});
        })
        .catch(err => {
            res.status(400).json({ message: 'Error in posting comment.' + err});
        });
    },
    async deleteStoryComment(req, res) {
        
        await Comment.destroy({
            where: {id: req.body.id}
        })
        .then(() => {
            res.status(200).json({message: "succeeded in posting new comment"});
        })
        .catch(err => {
            res.status(400).json({ message: 'Error in posting comment.'});
        });
    },
    
    async getStoryHashtag(req, res) {

        Stories_hashtag.findAll({
            where: {story_id: req.params.storyId},
            include: [{
                model: Hashtag,
                attributes: ['hashtag_name', 'id']
            }],
        })
        .then( rows => {
            res.status(200).json(rows);
        })
        .catch( err => {
            res.status(400).json(err);
        })
    },
    async postStoryHashtag(req, res) {

        Hashtag.findOne({
            where: {hashtag_name: req.body.hashtag_name}
        })
        .then( row => {
            
            if(row) {
                Stories_hashtag.create({
                    hashtag_id: row.id,
                    story_id: req.params.storyId
                })
                .then(() =>{
                    res.status(200).json({message: "succeeded in creating hashtag"});
                })
                .catch(err => {
                    res.status(400).json({ message: 'Error in creating hashtag' + err});
                })
            } else {
                res.status(400).json({ message: 'no such hashtag exists.'});
            }
        })
        .catch( err => {
            res.status(400).json({ message: 'erro in retrieving hashtag.' + err});
        })
    },
    async postClap(req, res) {
    
        await Clap.findOne({where: {user_id: req.userId,
                                story_id: req.body.storyId}})
            .then(async clap => {
                if(clap!=null) {
                    if (clap.clap_number < 5) {
                        await Clap.update({clap_number: Sequelize.literal('clap_number+1')}, {where: {user_id: req.userId,
                            story_id: req.body.storyId}})
                            .then(()=>{
                                return res.status(200).send({clap_number: clap.clap_number + 1})
                            })
                    } else {
                        return res.status(200).send({clap_number: clap.clap_number})
                    }
                    
                } else {
                    await Clap.create({user_id: req.userId, story_id: req.body.storyId, clap_number: 1})
                        .then(()=>{
                            return res.status(200).send({clap_number: 1});
                        })
                }
        }).catch(err=>{
            return res.status(500).send("error in clapping: " + err);
        })

    },

}