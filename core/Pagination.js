const Pagination = {
    getPagination : (page, size) => {
        const limit = size ? +size : 3;
        const offset = page ? page * limit : 0;
      
        return { limit, offset };
    },
    getStoryPagingData :  (data, page, limit) => {
        const { count: storiesCount, rows: stories } = data;
        const currentPage = page ? +page : 0;
        const totalPages = Math.ceil(storiesCount / limit);
      
        return { storiesCount, stories, totalPages, currentPage };
      },
      getUserPagingData :  (data, page, limit) => {
        const { count: usersCount, rows: users } = data;
        const currentPage = page ? +page : 0;
        const totalPages = Math.ceil(usersCount / limit);
      
        return { usersCount, users, totalPages, currentPage };
      }
}

module.exports = Pagination