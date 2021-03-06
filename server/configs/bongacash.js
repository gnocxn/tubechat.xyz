const bongaCashApiUrl = 'http://tools.bongacams.com/promo.php?c=301528&type=api&api_type=json';

export default function () {

    SyncedCron.add({
        name: 'update-models-bongacash',
        schedule: function (parser) {
            return parser.text('every 3 minutes');
        },
        job(){
            try {
                var result = request.getSync(bongaCashApiUrl);
                if (result.response.statusCode === 200) {
                    var models = JSON.parse(result.body);
                    if (models) {
                        console.log('Begin import...');
                        Meteor.call('models.offlines');
                        models = _.filter(models, function (model) {
                            return model.gender !== null
                        });
                        models.forEach(function (model) {
                            let _gender = 't';
                            if(model.gender === 'Female') _gender = 'f';
                            if(model.gender === 'Male') _gender = 'm';
                            if(model.gender.indexOf('Couple') > -1) _gender = 'c';
                            let _model = {
                                username: model.username,
                                display_name: model.display_name,
                                age: model.display_age,
                                gender : _gender,
                                is_hd : false,
                                is_new : false,
                                recorded : false,
                                current_show : model.chat_status,
                                chat_room_url: model.chat_url,
                                image_url : model.profile_images.thumbnail_image_big_live,
                                image_url_360x270 : model.profile_images.thumbnail_image_big_live,
                                iframe_embed : model.embed_chat_url,
                                iframe_embed_revshare : model.embed_chat_url,
                                seconds_online : model.online_time,
                                num_users : model.members_count,
                                num_followers : model.members_count,
                                source : 'BONGACASH'
                            }
                            Meteor.call('models.import', _model);
                        });
                        console.log('End import...', models.length);
                    }

                }
            } catch (ex) {
                console.log(ex);
            }
        }
    });

    SyncedCron.start();
}
