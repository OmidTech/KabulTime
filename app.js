const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const path = require('path');
const bcrypt = require('bcryptjs');
var fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const upload = multer({ dest: './Documents' });
const uri = process.env.MONGO_URI;
mongoose.connect("mongodb://localhost:27017/test");
const app = express();
exports.app = app;
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static("assets"));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
if (req.session.user) {
  const endDate = new Date();
  const startDate = new Date();
  const startex = new Date();
  const startDatea = new Date();
  startDate.setMonth(endDate.getMonth() - 2)
  startex.setMonth(endDate.getMonth() -1) 
  startDatea.setMonth(endDate.getMonth() - 4)
  const starts = new Date();
  starts.setHours(0, 0, 0, 0); // Start of today

  const ends = new Date();
  ends.setHours(23, 59, 59, 999); // End of today


  if (req.session.user.role == 'User') {
    
    stock.find().sort({ _id: -1 }).then((al) => {
      useractivity.find({createdAt: { $gte: startDate, $lt: endDate }}).then((u) => {
      res.render("Homeu", { bb: al,uas:u,us:req.session.user });
    })
  })
    
  } else if (req.session.user.role == 'Admin') {
    profit.find().sort({ _id: -1 }).then((al) => {
      profit.find({createdAt: { $gte: starts, $lt: endDate }}).then((rev) => {
        expense.find({createdAt: { $gte: starts, $lt: ends }}).then((exp) => {
        order.find({createdAt: { $gte: starts, $lt: ends }}).then((ord) => {
      useractivity.find({createdAt: { $gte: startDate, $lt: endDate }}).sort({ _id: -1 }).then((u) => {
      res.render("home", { bb: al,uas:u,ord:ord,exp:exp,rev:rev,us:req.session.user });
    })
  }) })})})
  } else {
    res.redirect("/login")
  }
}else {
  res.redirect("/login")
}
})
app.get('/backupr', function (req, res) {
  if (req.session.user) {

    res.render('backup',{us:req.session.user})

  } else {
    res.redirect('/login');
  }
})
app.post('/backup', async (req, res) => {
  const urli="mongodb://localhost:27017/test"
  const client = new MongoClient(urli, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(); // Use the default database or specify one
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const colName = collection.name;
      const data = await db.collection(colName).find({}).toArray();
      const filePath = path.join(__dirname, 'backup', `backup_${colName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Backup created for collection: ${colName}`);
    }

    res.send('Backup completed successfully. Files created: ' + collections.map(c => `backup_${c.name}.json`).join(', '));
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).send('Error creating backup');
  } finally {
    await client.close();
  }
});

// Restore route
app.post('/restore', async (req, res) => {
  const urli="mongodb://localhost:27017/test"
  const client = new MongoClient(urli);
  const uploadsDir = path.join(__dirname, 'backup');

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Read all JSON files from the uploads directory
    const files = fs.readdirSync(uploadsDir).filter(file =>
      file.endsWith('.json') // Ensure only JSON files are processed
    );

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      console.log(`Restoring data from file: ${filePath}`);

      // Check if it's a file before reading
      if (fs.statSync(filePath).isFile()) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const collectionName = file.replace('backup_', '').replace('.json', '');

        // Check if data is an array and not empty
        if (Array.isArray(data) && data.length > 0) {
          await db.collection(collectionName).deleteMany({}); // Clear existing data
          await db.collection(collectionName).insertMany(data); // Restore data
          console.log(`Restored collection: ${collectionName}`);
        } else {
          console.warn(`No data to restore for collection: ${collectionName}`);
        }
      } else {
        console.warn(`Skipping non-file: ${filePath}`);
      }
    }

    res.send('Database restored successfully from backup files.');
  } catch (err) {
    console.error('Error restoring database:', err);
    res.status(500).send('Error restoring database');
  } finally {
    await client.close();
  }
});
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // User is authenticated
  }
  res.redirect('/'); // Redirect to login if not authenticated
}

// Middleware to check user role
function isAuthorized(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      return next(); // User has the required role
    }
    res.status(403).send('Access denied.'); // User does not have access
  };
}

app.get('/stock', function (req, res) {
  if (req.session.user) {
    stock.find().sort({ createdAt: -1 }).then((pro) => {
      res.render("stock", { pro: pro,us:req.session.user })
    })
  } else {
    res.redirect('/login');
  }

})
app.get('/userpage', isAuthorized('Admin'), function (req, res) {
  if (req.session.user) {
    user.find().sort({ createdAt: 1 }).then((pro) => {
      res.render("userpage", { pro: pro,us:req.session.user })
    })
  } else {
    res.redirect('/login');
  }

})
app.get('/pricelist', function (req, res) {
  if (req.session.user) {
    pricelist.find().sort({ createdAt: -1 }).then((pro) => {

      stock.find().sort({ createdAt: -1 }).then((un) => {
        res.render("pricelist", { pro: pro, un: un,us:req.session.user })
      })
    })
  } else {
    res.redirect('/login');
  }


})

app.post('/updpri', function (req, res) {

  let rm = req.body.ur;
  let p = req.body.urm;
  let sc = req.body.sc;
  let pp = req.body.p;
  let bn = parseInt(p) - parseInt(pp);

  pricelist.findOneAndUpdate({ item: rm }, {
    price: parseInt(p),
    currency: sc, purchase_price: parseInt(pp), profit: parseInt(bn),

  }).then(() => {
    
    const ua=new useractivity({
      username:req.session.user.username,
      type:"Update Price",
      description:rm,
    })
    ua.save();
    res.redirect('/pricelist');
  })
});

app.get('/purchasedeleted/:id/:n/:q', function (req, res) {
  let iid = req.params.id;
  let nn = req.params.n;
  let qq = parseInt(req.params.q);


  stock.findOneAndUpdate({ item: nn }, { $inc: { quantity: -qq } }).then(() => {
    purchase.findByIdAndDelete({ _id: iid }).then(() => {
    }).catch((error) => {
      res.status(500).json(error)
    });

    const ua=new useractivity({
      username:req.session.user.username,
      type:"Delete Purchase",
      description:nn,
    })
    ua.save();
    res.redirect("/purchase")
  });

})
app.get('/userdelete/:id', isAuthorized('Admin'), function (req, res) {
  let iid = req.params.id;
  user.find().then((all) => {

    if (all.length > 1) {
      user.findByIdAndDelete({ _id: iid }).then(() => {
        const ua=new useractivity({
          username:req.session.user.username,
          type:"Delete User",
          description:iid,
        })
        ua.save();
        res.redirect("/userpage")
      });
    } else {
      res.redirect("/userpage")
    }
  });
})
app.get('/purchase', function (req, res) {
  if (req.session.user) {
    pricelist.find().sort({ createdAt: -1 }).then((pro) => {

      stock.find().sort({ createdAt: -1 }).then((un) => {
        res.render("pricelist", { pro: pro, un: un ,us:req.session.user})
      })
    })
    purchase.find().sort({ createdAt: -1 }).then((pro) => {
      res.render("purchase", { pro: pro,us:req.session.user })
    })

  } else {
    res.redirect('/login');
  }


})
app.post('/newpurchase', function (req, res) {
  let n = req.body.pname
  let q = req.body.pquantity
  let u = req.body.sun;
  let sc = req.body.sc;
  let p = new purchase({
    name: req.body.pname,
    price: req.body.pprice,
    quantity: req.body.pquantity,
    unit: req.body.sun,
    currency: req.body.sc,
    total: req.body.total
  });

  stock.findOneAndUpdate({ item: n }, { $inc: { quantity: q }, $set: { unit: u } }, { new: true, upsert: true }).then((it) => { });
  pricelist.findOne({ item: n })
    .then((existingStock) => {
      if (!existingStock) {
        const pr = new pricelist({
          item: n,
        });

        return pr.save();
      }
    })
  p.save();
  const ua=new useractivity({
    username:req.session.user.username,
    type:"Purchase Product",
    description:n,
  })
  ua.save();
  res.redirect("/purchase")
})

app.get('/order1', function (req, res) {
  if (req.session.user) {
    order.findOne({}).sort({ _id: -1 }).then((all) => {
      customer.find({}).sort({ name: 1 }).then((ct) => {
        stock.find({}).sort({ item: 1 }).then((it) => {
          currency.find({}).then((cr) => {
            res.render('order1', { bb: all, cit: ct, iit: it, cur: cr,us:req.session.user })
          })
        })
      })
    })
  } else {
    res.redirect('/login');
  }


});
app.get('/saleslist', function (req, res) {
  if (req.session.user) {
    Payment.find({}).sort({ _id: -1 }).then((all) => {

      res.render('saleslist', { bb: all,us:req.session.user })
    })
  } else {
    res.redirect('/login');
  }


});
app.get('/salesReport', function (req, res) {
  if (req.session.user) {
    order.find({}).sort({ _id: -1 }).then((all) => {

      res.render('salesReport', { bb: all,us:req.session.user })

    })
  } else {
    res.redirect('/login');
  }
});
app.get('/invoice', function (req, res) {
  if (req.session.user) {
    const id = req.body.findd;
    let pb = req.body.pp;
    order.find({ bill: id }).then((all) => {
      Payment.find({ billno: pb }).then((pay) => {
        res.render('invoice', { bb: all, p: pay,us:req.session.user })
      })

    })

  } else {
    res.redirect('/login');
  }
});
app.post('/invoiceb', function (req, res) {
  if (req.session.user) {
    const id = parseInt(req.body.findd);
    let pb = req.body.pp;
    order.find({ bill: id }).then((all) => {
      Payment.findOne({ billno: pb }).then((pay) => {
        customer.find({}).then((cust) => {
          res.render('saleinvoice', { bb: all, p: pay, cus: cust,us:req.session.user })
        })

      })

    })
  } else {
    res.redirect('/login');
  }
});
app.post('/PayReport', function (req, res) {
  if (req.session.user) {
    dt=req.body.startDate;
    ed=req.body.endDate;
    dd=Date();
    const a="Payments Report"
    Payment.find({createdAt: { $gte: dt, $lt: ed }}).sort({ _id: 1 }).then((all) => {
          res.render('PayReport', { bb: all,dd:dd, p: a,st:dt,ed:ed,us:req.session.user })
      
    })
  } else {
    res.redirect('/login');
  }
});
app.post('/ExpReport', function (req, res) {
  if (req.session.user) {
    dt=req.body.startDate;
    ed=req.body.endDate;
    dd=Date();
    const a="Expense Report"
    expense.find({createdAt: { $gte: dt, $lt: ed }}).sort({ _id: 1 }).then((all) => {
          res.render('ExpReport', { bb: all,dd:dd, p: a,st:dt,ed:ed,us:req.session.user })
      
    })
  } else {
    res.redirect('/login');
  }
});
app.post('/purchaseReport', function (req, res) {
  if (req.session.user) {
    dt=req.body.startDate;
    ed=req.body.endDate;
    dd=Date();
    const a="Purchase Report"
    purchase.find({createdAt: { $gte: dt, $lt: ed }}).sort({ _id: 1 }).then((all) => {
          res.render('purchaseReport', { bb: all,dd:dd, p: a,st:dt,ed:ed,us:req.session.user })
      
    })
  } else {
    res.redirect('/login');
  }
});
app.get('/stockReport', function (req, res) {
  if (req.session.user) {
    
    dd=Date();
    const a="Stock Report"
    stock.find().sort({ quantity: -1 }).then((all) => {
          res.render('stockReport', { bb: all,dd:dd, p: a,us:req.session.user })
      
    })
  } else {
    res.redirect('/login');
  }
});

app.post('/saleReportfilter', function (req, res) {
  if (req.session.user) {
    dt=req.body.startDate;
    ed=req.body.endDate;
    dd=Date();
    const a="Sale Report"
    order.find({createdAt: { $gte: dt, $lt: ed }}).sort({ _id: 1 }).then((all) => {
          res.render('saleReportfilter', { bb: all,dd:dd, p: a,st:dt,ed:ed,us:req.session.user })
      
    })
  } else {
    res.redirect('/login');
  }
});
app.post('/returnReport', function (req, res) {
  if (req.session.user) {
    dt=req.body.startDate;
    ed=req.body.endDate;
    dd=Date();
    const a="Sale Report"
    orderReturn.find({createdAt: { $gte: dt, $lt: ed }}).sort({ _id: 1 }).then((all) => {
          res.render('returnReport', { bb: all,dd:dd, p: a,st:dt,ed:ed,us:req.session.user })
      
    })
  } else {
    res.redirect('/login');
  }
});

app.get('/order', function (req, res) {
  if (req.session.user) {
    order.findOne({}).sort({ _id: -1 }).then((all) => {

      res.render('order', { bb: all,us:req.session.user })

    })
  } else {
    res.redirect('/login');
  }



});

app.get('/price/:item', async (req, res) => {
  if (req.session.user) {
    try {
      const itemName = req.params.item;
      const priceItem = await pricelist.findOne({ item: itemName });
      if (priceItem) {
        res.status(200).send({ price: priceItem.price, currency: priceItem.currency, profit: priceItem.profit });
      } else {
        res.status(404).send({ message: 'Item not found' });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.redirect('/login');
  }

});

app.get('/unit/:item', async (req, res) => {
  if (req.session.user) {
    try {
      const itemName = req.params.item;
      const priceItem = await stock.findOne({ item: itemName });
      if (priceItem) {
        res.status(200).send({ unit: priceItem.unit });
      } else {
        res.status(404).send({ message: 'Item not found' });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.redirect('/login');
  }

});
app.get('/currency/:item', async (req, res) => {
  if (req.session.user) {
    try {
      const itemName = req.params.item;
      const priceItem = await pricelist.findOne({ item: itemName });
      if (priceItem) {
        res.status(200).send({ profit: priceItem.profit });
      } else {
        res.status(404).send({ message: 'Item not found' });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/stock/:item', async (req, res) => {
  if (req.session.user) {
    try {
      const itemName = req.params.item;
      const stockItem = await stock.findOne({ item: itemName });
      if (stockItem) {
        res.status(200).send({ quantity: stockItem.quantity });
      } else {
        res.status(404).send({ message: 'Item not found' });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.redirect('/login');
  }

});

app.post('/savedorder', function (req, res) {
  if (req.session.user) {
    const { scn, sc, sit, qquan, pprice, sunit, tt, gt, pd, rm, bil, bilno } = req.body;
    const entries = [];
   
    

    if (Array.isArray(sit)) {
      for (let i = 0; i < sit.length; i++) {

        const entry = new order({

          bill: parseFloat(bil),
          customer: scn,
          currency: req.body.sc,
          item: sit[i],
          unit: sunit[i],
          price: parseFloat(pprice[i]),
          quantity: parseFloat(qquan[i]),
          totalAmount: parseFloat(tt[i])

        });
        entries.push(entry);
        stock.findOneAndUpdate({ item: sit[i] }, { $inc: { quantity: -qquan[i] } }).then((it) => { });
        const p = new Payment({
          billno: req.body.biln,
          customern: req.body.scn,
          Paid: parseFloat(req.body.pd),
          Total: parseFloat(req.body.gt),
          currency: req.body.sc,
          remain: parseFloat(req.body.rm),
          discount: parseFloat(req.body.dis)
        });
        p.save();
        const ua=new useractivity({
          username:req.session.user.username,
          type:"Sale Products",
          description:req.body.biln,
        })
        ua.save();
        const pr = new profit({
          description: req.body.biln,
          currency: req.body.sc,
          benefit: req.body.prof,
        })
        pr.save();
        
      }
      try {
        // Use Promise.all to save all entries concurrently
        Promise.all(entries.map(order => order.save()));
        
      } catch (error) {
        res.status(500).send('Error saving entries: ' + error.message);

      }

      
        Payment.findOne({ billno: req.body.biln }).then((pay) => {
          customer.find({}).then((cust) => {
            res.render('saleinvoice', { bb: entries, p: pay, cus: cust,us:req.session.user })
          })
          
        })
  
      
    
    } else {
      const entry = new order({

        bill: parseFloat(bil),
        customer: scn,
        currency: req.body.sc,
        item: sit,
        unit: sunit,
        price: parseFloat(pprice),
        quantity: parseInt(qquan),
        totalAmount: parseFloat(tt)

      });
      entry.save();

      stock.findOneAndUpdate({ item: sit }, { $inc: { quantity: -qquan } }).then((it) => { });


    }
    const p = new Payment({
      billno: req.body.biln,
      customern: req.body.scn,
      Paid: parseFloat(req.body.pd),
      Total: parseFloat(req.body.gt),
      currency: req.body.sc,
      remain: parseFloat(req.body.rm),
      discount: parseFloat(req.body.dis)
    });
    p.save();
    const ua=new useractivity({
      username:req.session.user.username,
      type:"Sale Products",
      description:req.body.biln,
    })
    ua.save();

    
    const pr = new profit({
      description: req.body.biln,
      currency: req.body.sc,
      benefit: req.body.prof,
    })
    pr.save();
   
      Payment.findOne({ billno: req.body.biln }).then((pay) => {
        customer.find({}).then((cust) => {
          res.render('saleinvoice', { bb: entries, p: pay, cus: cust })
        })
        
      })

    

  } else {
    res.redirect('/login');
  }
  

});


app.post('/neworder', async (req, res) => {
  if (req.session.user) {
    const { payme, itms } = req.body; // Expecting user, orders, and productUpdate as JSON

    try {
      // Create and save the user
      const paym = new Payment(payme);
      await paym.save();

      // Create and save the orders
      const orderPromises = itms.map(itm => {
        return new order({
          bill: order.bill, // Associate orders with the new user
          customer: order.customer,
          quantity: order.quantity,
          unit: order.unit,
          price: order.price,
          item: order.item,
          totalAmount: order.totalAmount
        }).save();
      });

      // Wait for all orders to be saved
      await Promise.all(orderPromises);

      return res.json({ message: 'All data saved successfully!' });
    } catch (err) {
      console.error('Error saving data:', err);
      if (!res.headersSent) {
        return res.status(500).json({ message: 'Error saving data' });
      }
    }
  } else {
    res.redirect('/login');
  }


});
app.get('/customer', function (req, res) {
  if (req.session.user) {
    customer.find({}).sort({ _id: -1 }).then((all) => {

      res.render('customer', { bb: all,us:req.session.user })

    })
  } else {
    res.redirect('/login');
  }
});
app.get('/drawings',isAuthorized('Admin'), function (req, res) {
  if (req.session.user) {
    drawings.find({}).sort({ _id: -1 }).then((all) => {

      res.render('drawings', { bb: all ,us:req.session.user})

    })
  } else {
    res.redirect('/login');
  }
});
app.post('/savedcustomer', function (req, res) {
  if (req.session.user) {
    const username=req.session.user.username;
    const c = new customer({
      name: req.body.cn,
      address: req.body.add,
      phone: req.body.pn
    })
    c.save();
    const ua=new useractivity({
      username:username,
      type:"Add New Customer",
      description:req.body.cn,
    })
    ua.save();
    res.redirect("/customer")
  } else {
    res.redirect('/login');
  }
});
app.post('/savedrawings', function (req, res) {
  if (req.session.user) {
    const c = new drawings({
      name: req.body.cn,
      amount: req.body.add,
      currency:req.body.cc,
      type: req.body.sc
    })
    c.save();

    const ua=new useractivity({
      username:req.session.user.username,
      type:"Drawings",
      description:req.body.cn+" - "+req.body.sc+' - '+ String(req.body.add),
    })
    ua.save();
    res.redirect("/drawings")
  } else {
    res.redirect('/login');
  }
})
app.get('/orderReturn', function (req, res) {
  if (req.session.user) {
    orderReturn.find({}).sort({ _id: -1 }).then((all) => {

      res.render('orderReturn', { bb: all,us:req.session.user })

    })
  } else {
    res.redirect('/login');
  }
});
app.post('/returnorder', function (req, res) {
  if (req.session.user) {
    const c = new orderReturn({
      orderId: req.body.cn,
      quantity: req.body.qq,
      reason: req.body.add,
      amount: parseFloat(req.body.pn),
    })
    c.save();
    const ua=new useractivity({
      username:req.session.user.username,
      type:"Return Order",
      description:req.body.cn,
    })
    ua.save();
    res.redirect("/orderReturn")
  } else {
    res.redirect('/login');
  }
})
app.get('/ordelete/:id', function (req, res) {

  let iid = req.params.id;

  orderReturn.findByIdAndDelete({ _id: iid }).then(() => {
    const ua=new useractivity({
      username:req.session.user.username,
      type:"Return Order Delete",
      description:"Check the Date",
    })
    ua.save();
    res.redirect("/orderReturn")

  }).catch((error) => {
    res.status(500).json(error)
  });

});
app.get('/cdeleted/:id', function (req, res) {

  let iid = req.params.id;

  customer.findByIdAndDelete({ _id: iid }).then(() => {
    const ua=new useractivity({
      username:req.session.user.username,
      type:"Delete Customer",
      description:"Check the Date",
    })
    ua.save();
    res.redirect("/customer")
  }).catch((error) => {
    res.status(500).json(error)
  });

});
app.post('/updcr/:id', function (req, res) {
  let iid = req.params.id;
  currency.findByIdAndUpdate({ _id: iid }, { rate: parseFloat(req.body.cr) }).then(() => {
    const ua=new useractivity({
      username:req.session.user.username,
      type:"Update Currency Rate",
      description:String(req.body.cr),
    })
    ua.save();
    res.redirect("/order1")
  }).catch((error) => {
    res.status(500).json(error)
  });

});
app.post('/updpayment', function (req, res) {
  if (req.session.user) {
    let iid = req.body.bil;
    let rm = req.body.ur;
    let p = req.body.urm;
    let pad = req.body.pd;
    const sum = Number(p) + Number(pad);
    const minu = rm - p;

    Payment.findOneAndUpdate({ billno: iid }, {
      Paid: parseInt(sum)
      , remain: parseInt(minu)
    }).then(() => {
      const ua=new useractivity({
        username:req.session.user.username,
        type:"Update Payment",
        description:iid+' - '+String(p),
      })
      ua.save();
      res.redirect('/saleslist')
    })

  } else {
    res.redirect('/login');
  }

});
app.post('/stockupd', function (req, res) {
  if (req.session.user) {
    let it = req.body.bil;
    let un = req.body.ur;
    let q = req.body.urm;

    stock.findOneAndUpdate({ item: it }, {
      unit: un
      , quantity: parseInt(q)
    }).then(() => {
      const ua=new useractivity({
        username:req.session.user.username,
        type:"Update Stock",
        description:it+" - "+un+" - "+q,
      })
      ua.save();
      res.redirect('/stock')
    })
  } else {
    res.redirect('/login');
  }


});
app.post('/userupd', isAuthorized('Admin'), function (req, res) {
  if (req.session.user) {
    let it = req.body.bil;
    let q = req.body.urm;

    user.findOneAndUpdate({ username: it }, {
      role: q,
    }).then(() => {
      const ua=new useractivity({
        username:req.session.user.username,
        type:"Update User",
        description:it+" - "+q,
      })
      ua.save();
      res.redirect('/userpage')
    })
  } else {
    res.redirect('/login');
  }


});
app.get('/expense', function (req, res) {
  if (req.session.user) {
    expense.find({}).sort({ _id: -1 }).then((all) => {

      res.render('expenses', { bb: all,us:req.session.user })

    })
  } else {
    res.redirect('/login');
  }

});
app.post('/newexpense', function (req, res) {
  if (req.session.user) {
    const c = new expense({
      description: req.body.des,
      catagory: req.body.ct,
      currency: req.body.sc,
      amount: req.body.am,
    })
    c.save();
    const ua=new useractivity({
      username:req.session.user.username,
      type:"Expense",
      description:req.body.ct+" - "+req.body.sc+" - "+String(req.body.am),
    })
    ua.save();
    res.redirect("/expense")
  } else {
    res.redirect('/login');
  }


});
app.get('/expensedeleted/:id', function (req, res) {
  if (req.session.user) {
    let iid = req.params.id;

    expense.findByIdAndDelete({ _id: iid }).then((a) => {
      const ua=new useractivity({
        username:req.session.user.username,
        type:"Delete Expense",
        description:a.catagory+" "+a.amount,
      })
      ua.save();
      res.redirect("/expense")
    }).catch((error) => {
      res.status(500).json(error)
    });

  } else {
    res.redirect('/login');
  }

});

app.get('/login', function (req, res) {

  res.render('login')
});


app.post('/signin', (req, res) => {
  const username = req.body.tuser;
  const password = req.body.tpassword;
  user.findOne({ username: username }).then((foundUser) => {
    if (!foundUser) {
      // User not found
      return res.send('User not found. <a href="/">Try again</a>');
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = bcrypt.compareSync(password, foundUser.password);

    if (isPasswordValid) {
      // Password is valid
      req.session.user = { username: foundUser.username, role: foundUser.role }; // Assuming you have a role property
      res.redirect('/');
    } else {
      // Password is invalid
      res.send('Invalid password. <a href="/">Try again</a>');
    }
  }).catch(err => {
    console.error(err);
    res.status(500).send('An error occurred. Please try again later.');
  });

});
app.get('/register', isAuthorized('Admin'), function (req, res) {
  if (req.session.user) {
    res.render('register')
  } else {
    res.redirect('/login');
  }



});
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect('/'); // Redirect back to profile if there's an error
    }
    res.redirect('/login'); // Redirect to the login page after successful logout
  });
});
app.post('/newuser', async (req, res) => {
  const name=req.body.name;
  const username = req.body.tuser;
  const password = req.body.tpassword;
  const role = req.body.radio;
  const hashedPassword = await bcrypt.hash(password, 10);
  const us = new user({ username: username,name:name, password: hashedPassword, role: role });
  const ua=new useractivity({
    username:req.session.user.username,
    type:"New User",
    description:req.body.tuser+" "+req.body.radio,
  })
  ua.save();
  try {
    await us.save();
    res.redirect('/userpage')
  } catch (error) {
    res.status(400).send('Error registering user');
  }


});


const purchaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  currency: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number },
  createdAt: { type: Date, default: Date.now }
});
const purchase = mongoose.model('Purchase', purchaseSchema);

const stockSchema = new mongoose.Schema({
  item: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
});
const stock = mongoose.model('Stock', stockSchema);

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const customer = mongoose.model('Customer', customerSchema);

const orderSchema = new mongoose.Schema({
  bill: { type: Number },
  customer: { type: String, required: true },
  currency: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  item: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const order = mongoose.model('Order', orderSchema)

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  catagory: { type: String, required: false },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const expense = mongoose.model('Expense', expenseSchema);

const orderReturnSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  reason: { type: String, required: true },
  quantity: { type: Number },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const orderReturn = mongoose.model('OrderReturn', orderReturnSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, require: true },
  createdAt: { type: Date, default: Date.now }
});
const user = mongoose.model('User', userSchema);

const paymentSchema = new mongoose.Schema({
  billno: { type: String, required: true },
  customern: { type: String, required: true },
  currency: { type: String, required: true },
  Paid: { type: Number, required: true },
  Total: { type: Number, required: true },
  remain: { type: Number, required: true },
  discount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Payment = mongoose.model('Payment', paymentSchema);

const priceSchema = new mongoose.Schema({
  item: { type: String, unique: true, required: true },
  currency: { type: String },
  purchase_price: { type: Number },
  price: { type: Number },
  profit: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const pricelist = mongoose.model('pricelist', priceSchema);

const profitSchema = new mongoose.Schema({
  description: { type: String, required: true },
  currency: { type: String },
  benefit: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const profit = mongoose.model('profit', profitSchema);
const currencySchema = new mongoose.Schema({

  rate: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const currency = mongoose.model('currency', currencySchema);

const drawingsSchema = new mongoose.Schema({

  name: { type: String, required: true },
  type: { type: String },
  currency: { type: String },
  amount: { type: Number },
  createdAt: { type: Date, default: Date.now }
});
const drawings = mongoose.model('drawings', drawingsSchema);

const useractivitySchema = new mongoose.Schema({
  username:{type: String, required: true},
  type:{type: String, required: true},
  createdAt: { type: Date, default: Date.now },
  description:{type: String, required: true}
})
const useractivity = mongoose.model('useractivity', useractivitySchema);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});