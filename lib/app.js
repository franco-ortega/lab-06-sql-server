const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

//Get all potions
// app.get('/potions', async(req, res) => {
//   try {
//     const data = await client.query('SELECT * from potions');
    
//     res.json(data.rows);
//   } catch(e) {
    
//     res.status(500).json({ error: e.message });
//   }
// });

//Get a single potion
// app.get('/potions/:id', async(req, res) => {
//   try {
//     const potionId = req.params.id;
    
//     const data = await client.query(`
//     SELECT * from potions
//     WHERE potions.id=$1
//     `, [potionId]);
    
//     res.json(data.rows[0]);
//   } catch(e) {
    
//     res.status(500).json({ error: e.message });
//   }
// });

//Post/create a potion
app.post('/potions', async(req, res) => {
  try {
    const newPotion = req.body.potion;
    const newSpellLevel = req.body.spell_level;
    const newTasty = req.body.tasty;
    const newBrand = req.body.brand;
    const newOwnerId = req.body.owner_id;
    
    const data = await client.query(`
    INSERT INTO potions (potion, spell_level, tasty, brand, owner_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,

    [newPotion, newSpellLevel, newTasty, newBrand, newOwnerId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

//Put/update a potion
app.put('/potions/:id', async(req, res) => {
  try {
    const newPotion = req.body.potion;
    const newSpellLevel = req.body.spell_level;
    const newTasty = req.body.tasty;
    const newBrand = req.body.brand;
    const newOwnerId = req.body.owner_id;
    
    const data = await client.query(`
    UPDATE potions
    SET potion = $1,
    spell_level = $2,
    tasty = $3,
    brand = $4,
    owner_id = $5
    WHERE potions.id = $6
    RETURNING *
    `,

    [newPotion, newSpellLevel, newTasty, newBrand, newOwnerId, req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

//Delete a potion
app.delete('/potions/:id', async(req, res) => {
  try {
    const potionId = req.params.id;
    
    const data = await client.query(`
    DELETE from potions
    WHERE potions.id=$1
    RETURNING *
    `,
    [potionId]);
    
    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});



//Get all brands
app.get('/brands', async(req, res) => {
  try {
    const data = await client.query('SELECT * from brands');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


//Get a single brand
app.get('/brands/:id', async(req, res) => {
  try {
    const brandId = req.params.id;
    
    const data = await client.query(`
    SELECT * from brands
    WHERE brands.id=$1
    `, [brandId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});



//Get all potions with a JOIN
app.get('/potions', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT
      potions.id,
      potion,
      spell_level,
      brands.name AS brand
    FROM potions
    JOIN brands
    ON brands.id = potions.brand_id
    ORDER BY brands.name ASC
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


//Get a single potion with a JOIN
app.get('/potions/:id', async(req, res) => {
  try {
    const potionId = req.params.id;
    
    const data = await client.query(`
    SELECT
      potions.id,
      potion,
      spell_level,
      brands.name AS brand
    FROM potions
    JOIN brands
    ON brands.id = potions.brand_id   
    WHERE potions.id=$1
    `, [potionId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});




app.use(require('./middleware/error'));

module.exports = app;
