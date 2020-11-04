require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns potions', async() => {

      const expectation = [
        {
          id: 1,
          potion: 'heal',
          spell_level: 1,
          tasty: true,
          brand: 'Ismelda\'s Elixir\'s',
          owner_id: 1
        },
        {
          id: 2,
          potion: 'sleep',
          spell_level: 3,
          tasty: false,
          brand: 'Davan\'s Draughts',
          owner_id: 1
        },
        {
          id: 3,
          potion: 'fly',
          spell_level: 5,
          tasty: true,
          brand: 'Arkex Brews',
          owner_id: 1
        },
        {
          id: 4,
          potion: 'eagle eyes',
          spell_level: 2,
          tasty: false,
          brand: 'Wild Tonics',
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/potions')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single potion', async() => {
      const expectation = {
        id: 1,
        potion: 'heal',
        spell_level: 1,
        tasty: true,
        brand: 'Ismelda\'s Elixir\'s',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/potions/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes a single potion from the database', async() => {
      const expectation = [
        {
          id: 1,
          potion: 'heal',
          spell_level: 1,
          tasty: true,
          brand: 'Ismelda\'s Elixir\'s',
          owner_id: 1
        },
        {
          id: 2,
          potion: 'sleep',
          spell_level: 3,
          tasty: false,
          brand: 'Davan\'s Draughts',
          owner_id: 1
        },
        {
          id: 3,
          potion: 'fly',
          spell_level: 5,
          tasty: true,
          brand: 'Arkex Brews',
          owner_id: 1
        },
      ];

      const deletedItem =   {
        id: 4,
        potion: 'eagle eyes',
        spell_level: 2,
        tasty: false,
        brand: 'Wild Tonics',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .delete('/potions/4')
        .expect('Content-Type', /json/)
        .expect(200);

      const allPotions = await fakeRequest(app)
        .get('/potions')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(deletedItem);
      expect(allPotions.body).toEqual(expectation);
    });

    test('adds a single potion to the database and returns it', async() => {
      const expectation = {
        id: 5,
        potion: 'swim',
        spell_level: 7,
        tasty: false,
        brand: 'Water Brews',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/potions')
        .send({
          potion: 'swim',
          spell_level: 7,
          tasty: false,
          brand: 'Water Brews',
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allPotions = await fakeRequest(app)
        .get('/potions')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allPotions.body.length).toEqual(4);
    });

    test('updates a single potion to the database and returns it', async() => {
      const expectation = {
        id: 1,
        potion: 'swim faster',
        spell_level: 75,
        tasty: false,
        brand: 'Water Brews',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .put('/potions/1')
        .send({
          potion: 'swim faster',
          spell_level: 75,
          tasty: false,
          brand: 'Water Brews',
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


  });
  
});
