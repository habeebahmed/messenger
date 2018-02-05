const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('9973512c1f434c67b1a47b7d2fcc47eb');
var news;
var title = [];
var url = [];
var url_image = [];



newsapi.v2.topHeadlines({
//sources: 'bbc-news',
//  q: '',
  category: 'entertainment',
  language: 'en',
  country: 'us'
}).then(response => {

    //console.log(response);
    for(let i=0 ; i<5 ; i++ ){
      title[i] = response.articles[i].title,
      url[i] = response.articles[i].url,
      url_image[i] = response.articles[i].urlToImage
    //  console.log(title[1]);

  /*
    {
      status: "ok",
      articles: [...]
    }
  */
}
    console.log(title[2]);

});
