"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(q) {
  let results = await axios.get('http://api.tvmaze.com/search/shows', {params: {q}});
  let showArray = [];
  for (let showEntry of results.data) {
    let imageUrl;
    if (showEntry.show.image) {
      imageUrl = showEntry.show.image.medium;
    } else {
      imageUrl = 'https://tinyurl.com/tv-missing';
    }
    showArray.push({
      id: showEntry.show.id,
      name: showEntry.show.name,
      summary: showEntry.show.summary,
      image: imageUrl
    });
  }
  return showArray;
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-primary btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  populateShows(shows);
  $episodesArea.hide();
}

$searchForm.on("submit", function (evt) {
  evt.preventDefault();
  searchForShowAndDisplay();
});

$showsList.on('click', '.Show-getEpisodes', function (evt) {
  evt.preventDefault();
  getEpisodesAndDisplay($(this));
});

/* episode button event handler: gets show Id and sends to getEpisodesOfShow,
** which then sends episode array to populateEpisodes to display episode list to DOM
*/

async function getEpisodesAndDisplay(buttonClicked) {
  const showId = buttonClicked.closest('.Show').data('show-id');
  const episodeArray = await getEpisodesOfShow(showId);
  populateEpisodes(episodeArray);
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let results = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodeArray = [];
  for (let episodeEntry of results.data) {
    episodeArray.push({
      id: episodeEntry.id,
      name: episodeEntry.name,
      season: episodeEntry.season,
      number: episodeEntry.number
    });
  }
  return episodeArray;
}

/** Adds episodes from episodes array to DOM as <li>s and unhides episodes area */

function populateEpisodes(episodes) {
  $('#episodes-list').empty();
  for (let episode of episodes) {
    $('#episodes-list').append(`
      <li data-episode-id="${episode.id}">
        ${episode.name} (season ${episode.season}, episode ${episode.number})
      </li>
    `);
  }
  $episodesArea.show();
}
