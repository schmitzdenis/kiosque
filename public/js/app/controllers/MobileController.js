define(['App', 'backbone', 'marionette', 'models/Model', 'collections/Magazines', 'collections/Downloads', 'collections/Repos', 'views/composites/Magazines', 'views/composites/Repos', 'views/MobileHeaderView', 'views/MagazineView'],

function(App, Backbone, Marionette, Model, MagazinesCollection, MagazinesDownloads, ReposCollection, MagazinesView, ReposView, MobileHeaderView, magazineView) {
    return Backbone.Marionette.Controller.extend({
        initialize: function(options) {

            var controller = this;

            // init magazine downloads stack collection
            App.downloads = new MagazinesDownloads();

            //Goto Controller action
            App.vent.on('goto', function(options) {
                controller[options.action](options.model);
            });

            //Listen to goto nav buttons
            $('.goto').live('click', function(event) {
                App.vent.trigger('goto', {
                    action: this.value,
                    model: null
                });
            });
        },

        //gets mapped to in AppRouter's appRoutes
        'repos': function() {
            App.headerRegion.show(new MobileHeaderView({
                model: new Model({
                    pageTitle: "Magazines Repositories"
                })
            }));
            App.mainRegion.show(new ReposView({
                collection: new ReposCollection([{
                    id: 1,
                    title: 'citroën',
                    content: 'all magazines provided by citroën'
                }])
            }));

        },
        // Show magazine feeds origins list
        'magazines': function(repo) {
            App.headerRegion.show(new MobileHeaderView({
                model: new Model({
                    action: 'repos',
                    label: 'repos list',
                    pageTitle: "Magazines list"
                })
            }));
            if (!App.collections.magazines) {
                App.collections.magazines = new MagazinesCollection([{
                        id: 1,
                        title: 'mag1',
                        content: 'htm5 content1',
                        uploadTime: '01-10-2013'
                    }, {
                        id: 2,
                        title: 'mag2',
                        content: 'htm5 content2',
                        downloadUrl: 'https://build.phonegap.com/apps/558893/download/android',
                        uploadTime: '09-01-2013'
                    }, {
                        id: 3,
                        title: 'mag3',
                        content: 'htm5 content3',
                        uploadTime: '01-09-2013'
                    }]);

            }

            App.mainRegion.show(new MagazinesView({ collection : App.collections.magazines }) );
        },
        // Show magazine reader for the given models/magazine
        'read': function(magazine) {
            App.headerRegion.show(new MobileHeaderView({
                model: new Model({
                    action: 'magazines',
                    label: 'magazines list',
                    pageTitle: "Magazine reader"
                })
            }));
            App.mainRegion.show(new magazineView({
                model: magazine
            }));
        }
    });
});