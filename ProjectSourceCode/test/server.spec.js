// ********************** Initialize server **********************************

const server = require('../src/index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// Two unit testcases
describe('register page!', () => {
  // Sample test case given to test / endpoint.
  it('Correctly serves register page', done => {
    chai
      .request(server)
      .get('/register')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).include('Register');
        done();
      });
  });
});

describe('login page!', () => {
  // Sample test case given to test / endpoint.
  it('Correctly serves login page', done => {
    chai
      .request(server)
      .get('/login')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).include('Login');
        done();
      });
  });
});