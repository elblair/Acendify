const server = require('../src/index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const bcrypt = require('bcryptjs');
const { expect } = chai;
const pgp = require('pg-promise')();


chai.use(chaiHttp);

// Mock user for testing
const testUser = {
  username: 'testuser',
  password: 'testpass123'
};

// Database configuration
const db = pgp({
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});


describe('Authentication Routes', () => {
  // Clear users table before test

  describe('POST /register', () => {
    it('should successfully register a new user', (done) => {
      chai
        .request(server)
        .post('/register')
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('login');
          done();
        });
    });
  });

  describe('GET /register', () => {
    it('should serve register page', (done) => {
      chai
        .request(server)
        .get('/register')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('Register');
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('should handle login with correct credentials', (done) => {
      chai
        .request(server)
        .post('/login')
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should handle invalid login credentials', (done) => {
      chai
        .request(server)
        .post('/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .end((err, res) => {
          expect(res.text).to.include('/login');
          done();
        });
    });
  });
});

describe('Protected Routes', () => {
  const protectedRoutes = [
    '/add_climb',
    '/add_ascent',
    '/user_settings'
  ];

  protectedRoutes.forEach(route => {
    it(`should redirect ${route} to login when not authenticated`, (done) => {
      chai
        .request(server)
        .get(route)
        .end((err, res) => {
          expect(res).to.redirect;
          expect(res.text).to.include('/login');
          done();
        });
    });
  });
});