var db = require('./../models/');

var exports = module.exports = {}


exports.showdashboard = function(req, res, next) {
  if (req.user.status == 'active')
    res.render('dashboard', { title: 'DATA WALLET' , user: req.user});
  else
    res.redirect('/user/logout');

}


exports.general = function(req, res, next) {
  if (req.user.status == 'active')
    res.render('general', { title: 'DATA WALLET' , user: req.user});
  else
    res.redirect('/user/logout');

}

exports.basket = function(req, res, next) {
  if (req.user.status == 'active')
    res.render('basket', { title: 'DATA WALLET' , basket_id: req.params.id});
  else
    res.redirect('/user/logout');

}

exports.addBasket = function(req, res, next) {

  var Basket = db.basket;
  var User = db.user;
  var basketnum = req.user.basketcount;
  var basefile = req.body.basefile;
  var desc = req.body.desc;
  var bpublic = req.body.pbk;
  var bname = req.body.bname+'_'+req.user.id;

  //console.log('\n\n '+ req.user.id);
  //console.log('\n\n' + basketnum);

  if(basketnum < 4 )
  {
    var data = { 'ownership': req.user.id, 'name': bname, 'description' : desc, 'public': bpublic};

    Basket.create(data).then(function(NewBasket, created) {
      if(!NewBasket)
        console.log('Something bad happened');

      if(NewBasket) {
        User.findOne({
            where: {id: req.user.id}
        }).then(function(user) {
            if(user.id == NewBasket.ownership) {
                user.updateAttributes({
                  basketcount: basketnum + 1,
                  base : basefile
                }).then(() => {
                  //console.log('\n\n\n\n ricevuto e scritto!!!\n\n\n\n\n\n')

                  basketnum++;
                  res.json({'basketcount': basketnum});
                })
              .catch((err) => {
                console.log('Error:', err);
                return done(null, 'ok');
              })
            }
            }).catch(function(err) {
            console.log('Error:', err);
            return done(null, false);
          });
      }


    }).catch(function(err) {
      console.log(err);
    });
  } else {
    res.send('You reached the limit, man. You already have '+ basketnum +'baskets');

  }



};

exports.addpubbKey = function(req, res, done) {
  var User = db.user;

  User.findOne({
      where: {id: req.user.id}
  }).then(function(user) {
      if(user.public_key == '0') {
          user.updateAttributes({
            public_key: req.body.public_key,
            base : req.body.base
          }).then(() => {

            res.json({'status': 'success'});

          })
        .catch((err) => {
          console.log('Error:', err);
          res.json({'status': 'failed'});
        })
      }
      }).catch(function(err) {
      console.log('Error:', err);
      res.json({'status': 'failed'});

    });

}

exports.getBasefile = function(req,res,next) {
  var User = db.user;

  User.findOne({
      where: {id: req.user.id}
  }).then(function(user) {

    res.json ({
                'basefile': user.base,
                'public': user.public_key,
                'bcount': user.basketcount,
                'userid': req.user.id
              });

      }).catch(function(err) {
      console.log('Error:', err);
      res.json({'status': 'failed'});

    });

};
