module.exports = function(app, apiRoutes, io){
  	var _entity ="request";
  	var _url_alias = "pedido";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function get(req, res){

      var REQ = req.params; 

       Model
       .find({_company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .populate("_company")
       .populate("_seller")
       .populate("_client")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function getRange(req, res){

      var REQ = req.params; 

       Model
       .find({
          _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"]), 
          _seller : REQ.seller,
          createdAt : {
            $gte: new Date(REQ.ini).toISOString(),
            $lt: new Date(REQ.end).toISOString()
          }
        })
       .populate("_company")
       .populate("_client")
       .populate("_seller")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }



    function getById(req, res){

      var REQ = req.params; 

       Model
       .findOne({_id : REQ.id})
       .populate("_user")
       .populate("_seller")
       .populate("_company")
       .populate("_client")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
    }

    function post(req, res){

  		var data = {};
  		var REQ = req.body || req.params;

      !REQ.data || (data.data = REQ.data);

      data.metadata = REQ.metadata;
      data.shoppingCart = REQ.shoppingCart;      
      data._seller = mongoose.Types.ObjectId(REQ._seller);
      data._client = mongoose.Types.ObjectId(REQ._client);
      data._company = mongoose.Types.ObjectId(req.headers["x-shoply-company"]);
            
  	 var model = new Model(data);

  		model.save(function(err, rs){
  			if(rs){
  				  res.json(rs);
            io.to(rs._company).emit('request', rs);
        }else{
  				res.json(err);
  			}
  		});

    }


    function update(req, res){
  		var data = {};
  		var REQ = req.body || req.params;
  		!REQ.data || (data.data = REQ.data);
      !REQ.metadata || (data.metadata = REQ.metadata);           

      data._seller =  mongoose.Types.ObjectId(REQ._seller);
      data._client =  mongoose.Types.ObjectId(REQ._client);
  		
      data = { $set : data };          

  		Model.update({ _id : mongoose.Types.ObjectId(req.params.id) },  data,function(err, rs){
  			if(rs){
  				res.json(err || rs);
  			}
  		});
    }


  function remove(req, res){
        Model.remove({_id : mongoose.Types.ObjectId(req.params.id), _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])}, function(err, rs){
              if(!err)
                  res.json(rs);
              else
                 res.status(500).json(err);
        });
	}

   
  function getByUser(req, res){
      var REQ = req.params; 

       Model
       .find({_seller : mongoose.Types.ObjectId(REQ.user) , _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])})
       .populate("_user")
       .populate("_seller")
       .populate("_company")
       .populate("_client")
       .exec(function(err, rs){
           if(!err)
           {
            res.json(rs);
           }
           else
            res.json(err);
       });
  }

  function facturado(req, res){
      Model.update({ _id : mongoose.Types.ObjectId(req.params.id), _company : mongoose.Types.ObjectId(req.headers["x-shoply-company"])}, {"data.estado" : 'Facturado'}, function(err, rs){
        if(!err){
          res.status(200).json(rs);
        }
      });
  }

    apiRoutes.get("/" + _url_alias, get);
    apiRoutes.get("/" + _url_alias + "/:seller/:ini/:end", getRange);
    apiRoutes.get("/" + _url_alias + "/:id", getById);
    apiRoutes.get("/" + _url_alias + "/user/:user", getByUser);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:id", update);
    apiRoutes.put("/" + _url_alias + "/:id/facturado", facturado);
    apiRoutes.delete("/" + _url_alias + "/:id", remove);

    return this;
}