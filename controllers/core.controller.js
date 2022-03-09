const jwt = require('jsonwebtoken');

const User = require('../db/models').User;
const Follow = require('../db/models').Follow;
const Comment = require('../db/models').Comment;
const Story = require('../db/models').Story;
const Hashtag = require('../db/models').Hashtag;
const Pagination = require('../core').Pagination;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {

    async uploadImage(req, res) {
          res.status(200).json({data:{filename: req.filename}});
    },
    
    async searchEngine(req, res) {
        
        if (req.query.searchType == "hashtags") {
            Hashtag.findAll({
               where: {hashtag_name: { [Op.like]: '%'+req.query.searchTerm+'%' }},
               attributes: ["id", "hashtag_name", "used_number"],
            })
            .then( data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(200).json({error: err});
            })

        } else if (req.query.searchType == "people") {
    
            const { page, size } = req.query;
            const { limit, offset } = Pagination.getPagination(page, size);

            await User.findAndCountAll({
                where: {
                    [Op.or]: [
                        {username: { [Op.like]: '%'+req.query.searchTerm+'%' }}, {bio_note: { [Op.like]: '%'+req.query.searchTerm+'%' }}
                    ],
                    id: {[Op.not]: req.userId}},
                order: [['created_at', 'DESC']],
                attributes: ["id", "username", "bio_note", "photo_url"],
                limit, offset 
             })
             .then( data => {
                const response = Pagination.getUserPagingData(data, page, limit);
                res.status(200).send(response);
             })
             .catch(err => {
                 res.status(200).json({error: err});
             })

        } else if (req.query.searchType == "content") {
            
            const { page, size } = req.query;
            const { limit, offset } = Pagination.getPagination(page, size);

            await Story.findAndCountAll({
                where: {content_pure: { [Op.like]: '%'+req.query.searchTerm+'%' }},
                include: [{
                    model: User,
                    attributes: ['id', 'photo_url', 'username', 'bio_note']
                }],
                order: [['clap_number', 'DESC']],
                attributes: ["id", "title", "created_at"],
                limit, offset 
             })
             .then( data => {
                const response = Pagination.getStoryPagingData(data, page, limit);
                res.status(200).send(response);
             })
             .catch(err => {
                 res.status(200).json({error: err});
             })
        } else if (req.query.searchType == "title") {
        
            const { page, size } = req.query;
            const { limit, offset } = Pagination.getPagination(page, size);

            await Story.findAndCountAll({
                where: {title: { [Op.like]: '%'+req.query.searchTerm+'%' }},
                include: [{
                    model: User,
                    attributes: ['id', 'photo_url', 'username', 'bio_note']
                }],
                order: [['clap_number', 'DESC']],
                attributes: ["id", "title", "created_at"],
                limit, offset 
             })
             .then( data => {
                const response = Pagination.getStoryPagingData(data, page, limit);
                res.status(200).send(response);
             })
             .catch(err => {
                 res.status(200).json({error: err});
             })
         } else {
            res.status(500).send("error");
         }
    },
async getHashtags(req, res) {
    const limit=10, offset=0;
    await  Hashtag.findAll({
        order: [['used_number', 'DESC']],
        limit, offset
       })
       .then(async hashtags => {
            return res.status(200).send(hashtags);
       })
       .catch(err => {
           res.status(500).send({
               message:
               err.message || "Some error occurred while retrieving tutorials."
           });
       });
   },
}