define([
  'jquery',
  'templates',
  'packery/js/packery',
  'imagesloaded',
  'draggabilly/draggabilly',
  'js/hackable-tile',
  'js/photobooth-tile',
  'jqueryui'
], function (
  $,
  templates,
  Packery,
  imagesLoaded,
  Draggabilly,
  HackableTile,
  PhotoBoothTile
) {
  return {
    init: function (options) {
      options = options || {};
      var self = this;

      // Element references -----------------------------------------------------

      self.container = options.container;
      self.$tiles = $('.tiles');
      self.$addTile = $('#add-tile');

      // Properties -------------------------------------------------------------

      // Setup ------------------------------------------------------------------
      self.packery = new Packery(options.container, {
        columnWidth: self.container.querySelector('.grid-sizer'),
        itemSelector: '.tile'
      });

      // Event Delegation -------------------------------------------------------
      var toggle = 0;
      self.$addTile.on('click', function (event) {
        event.preventDefault();
        if ( toggle ) {
          self.addHackableTile();
          toggle = 0;
        } else {
          self.addPhotoBooth();
          toggle = 1;
        }
      });
    },
    addAndBindDraggable: function (element, method) {
      var self = this;
      // Prepended or appended?
      method = ['prepended', 'appended'].indexOf(method) > -1 ? method : 'appended';

      var draggie;
      self.packery[method](element);

      draggie = new Draggabilly(element);
      self.packery.bindDraggabillyEvents(draggie);

      return element;
    },
    addHackableTile: function () {
      var self = this;
      var $hackableTile = $('<li class="tile webmaker hackable"></li>');
      var hackableTile = new HackableTile($hackableTile);

      // Reflow Packery when the hackable tile's layout changes
      hackableTile.on('resize', function () {
        self.packery.layout();
      });

      self.$tiles.prepend($hackableTile);
      self.addAndBindDraggable($hackableTile[0], 'prepended');
      self.packery.layout();
    },
    addPhotoBooth: function() {
      var self = this;
      var $photoBooth = $(templates.photoboothTile());
      var photoBooth = new PhotoBoothTile($photoBooth[0]);
      self.$tiles.prepend($photoBooth);
      photoBooth.init();
      photoBooth.on('resize', function () {
        self.packery.layout();
      });
      self.packery.prepended($photoBooth[0]);
      self.packery.layout();
    },
    render: function (data) {
      var self = this;
      var tileString = self.container.innerHTML;
      var tiles;

      data.forEach(function (tile) {
        // TODO: Some type checking
        var tileTemplate = templates[tile.type + 'Tile'] || templates.defaultTile;
        tileString += tileTemplate(tile);
      });

      self.container.innerHTML = tileString;
      tiles = self.container.querySelectorAll('.tile');

      for (var i = 0, ii = tiles.length; i < ii; i++) {
        self.addAndBindDraggable(tiles[i]);
      }

      imagesLoaded(self.container, function() {
        self.packery.layout();
      });
    }
  };
});
