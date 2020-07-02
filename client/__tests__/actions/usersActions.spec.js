import moxios from 'moxios';
import thunk from 'redux-thunk';
import faker from 'faker';
import lodash from 'lodash';
import configureMockStore from 'redux-mock-store';
import actionTypes from '../../actions/actionTypes';
import usersActions from '../../actions/usersActions';
import localStorage from '../../__mocks__/localStorage';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);

describe('User Actions', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });
  window.localStorage = localStorage;
  const password = faker.internet.password();
  const user = {
    password,
    id: 1,
    email: faker.internet.email(),
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    confirmPassword: password,
    roleId: 2,
  };
  const errorUser = {
    id: 1,
    firstname: 'Itunuloluwa',
    lastname: 'Fatoki',
    username: faker.internet.userName(),
    roleId: 2,
  };

  describe('Create Document Action', () => {
    it('creates and returns created document', (done) => {
      moxios.stubRequest('/api/v1/users', {
        status: 201,
        response: {
          user
        }
      });
      const store = mockStore({});
      store.dispatch(usersActions.signUserUp(user))
      .then(() => {
        expect(store.getActions()[0].type)
          .toEqual(actionTypes.SIGNUP_REQUEST);
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.ADD_USER);
        expect(store.getActions()[2].type)
          .toEqual(actionTypes.SIGNUP_SUCCESSFUL);
        expect(store.getActions()[1].payload)
          .toEqual(user);
      });
      done();
    });

    it('dispatches error on sign user up failed', (done) => {
      moxios.stubRequest('/api/v1/users', {
        status: 500,
        response: {
          message: 'server error'
        }
      });
      const store = mockStore({});
      store.dispatch(usersActions.signUserUp(user))
      .catch(() => {
        expect(store.getActions()[0].type)
          .toEqual(actionTypes.SIGNUP_REQUEST);
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.SIGNUP_FAILED);
        expect(store.getActions()[1].payload)
          .toEqual('server error');
      });
      done();
    });

    it('dispatch error when title is not specified', () => {
      moxios.stubRequest('api/v1/users', {
        status: 400,
        response: {
          message: 'title is required<br/>'
        }
      });

      const store = mockStore({});
      store.dispatch(usersActions.signUserUp(errorUser));
      expect(store.getActions()[1].type)
        .toEqual(actionTypes.SIGNUP_FAILED);
      expect(store.getActions()[1].payload)
        .toEqual('password is required<br/>email is required<br/>');
    });
  });

  describe('user sign in', () => {
    const token = faker.random.alphaNumeric(16);
    it('signs the user in and returns user and token', (done) => {
      moxios.stubRequest('api/v1/users/login', {
        status: 200,
        response: {
          user,
          token
        }
      });
      const store = mockStore({});
      store.dispatch(usersActions.logUserIn({
        username: 'itunuworks',
        password: 'itunuworks'
      }))
      .then(() => {
        expect(store.getActions()[0].type)
          .toEqual(actionTypes.LOGIN_REQUEST);
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.ADD_USER);
        expect(store.getActions()[1].payload)
          .toEqual(user);
        expect(store.getActions()[2].type)
          .toEqual(actionTypes.LOGIN_SUCCESSFUL);
      });
      done();
    });
    it('dispatches error when user password is invalid', (done) => {
      moxios.stubRequest('api/v1/users/login', {
        status: 401,
        response: {
          message: 'invalid password'
        }
      });
      const store = mockStore({});
      store.dispatch(usersActions.logUserIn({
        username: 'itunuworks',
        password: 'itunu'
      }))
      .catch((error) => {
        expect(store.getActions()[0].type)
          .toEqual(actionTypes.LOGIN_REQUEST);
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.LOGIN_FAILED);
        expect(store.getActions()[1].payload)
          .toEqual('invalid password');
        done(error);
      });
      done();
    });
    it('dispatches error when user password is not entered', () => {
      const store = mockStore({});
      store.dispatch(usersActions.logUserIn({
        username: 'itunuworks'
      }));
      expect(store.getActions()[0].type)
        .toEqual(actionTypes.LOGIN_REQUEST);
      expect(store.getActions()[1].type)
        .toEqual(actionTypes.LOGIN_FAILED);
      expect(store.getActions()[1].payload)
        .toEqual('password is required<br/>');
    });
  });

  describe('user log out', () => {
    it('logs the user out', (done) => {
      moxios.stubRequest('/api/v1/users/logout', {
        status: 200
      });
      const store = mockStore({});
      store.dispatch(usersActions.logUserOut())
      .then(() => {
        expect(store.getActions()[0].type)
          .toEqual(actionTypes.LOGOUT_REQUEST);
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.REMOVE_USER);
        expect(store.getActions()[2].type)
          .toEqual(actionTypes.LOGOUT_SUCCESSFUL);
      });
      done();
    });
  });

  describe('fetch all users action', () => {
    const users = lodash.map([1, 2, 3], id => ({
      id,
      email: faker.internet.email(),
      username: faker.internet.userName(),
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName()
    }));
    it('fetches users', (done) => {
      moxios.stubRequest('api/v1/users', {
        status: 200,
        response: {
          users
        }
      });

      const store = mockStore({});
      store.dispatch(usersActions.fetchAllUsers())
      .then(() => {
        expect(store.getActions()[1].type)
        .toEqual(actionTypes.FETCH_USERS_SUCCESSFUL);
        expect(store.getActions()[1].payload).toEqual(
          users
        );
      });
      done();
    });
  });

  describe('get single user', () => {
    it('gets the specified user from database', (done) => {
      moxios.stubRequest(`api/v1/users/${user.id}`, {
        status: 200,
        response: { user }
      });

      const store = mockStore({});
      store.dispatch(usersActions.getUser(user.id))
      .then(() => {
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.DOCUMENT_GET_SUCCESSFUL);
        expect(store.getActions()[1].payload.user).toEqual(
          user
        );
      });
      done();
    });

    it('dispatches error action if invalid user is requested', (done) => {
      moxios.stubRequest('api/v1/users/3000000', {
        status: 404,
        response: {
          message: 'user not found'
        }
      });
      const store = mockStore({});
      store.dispatch(usersActions.getUser(3000000))
      .catch(() => {
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.USER_GET_FAILED);
        expect(store.getActions()[1].payload).toEqual({
          message: 'user not found'
        });
      });
      done();
    });
  });

  describe('Update User profile', () => {
    it('returns the new user profile on success', (done) => {
      moxios.stubRequest(`api/v1/users/${user.id}`, {
        status: 200,
        response: {
          user
        }
      });

      const store = mockStore({});
      store.dispatch(usersActions.modifyUser(user.id, user))
      .then(() => {
        expect(store.getActions()[0].type)
          .toEqual(actionTypes.USER_MODIFY_REQUEST);
        expect(store.getActions()[1].payload)
          .toEqual(user);
      });
      done();
    });

    it('dispatchs error when invalid user is modified', (done) => {
      moxios.stubRequest('api/v1/users/3000000', {
        status: 404,
        response: {
          message: 'user not found'
        }
      });
      const store = mockStore({});
      store.dispatch(usersActions.modifyUser(3000000, errorUser))
      .catch(() => {
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.USER_MODIFY_FAILED);
        expect(store.getActions()[1].payload).toEqual(
          'user not found'
        );
      });
      done();
    });

    it('should fail modifying user when email field is edited but yet blank',
    () => {
      const store = mockStore({});
      store.dispatch(usersActions.modifyUser(errorUser.id, {
        ...errorUser, email: ''
      }));
      expect(store.getActions()[1].type)
        .toEqual(actionTypes.USER_MODIFY_FAILED);
      expect(store.getActions()[1].payload).toEqual(
        'email is required<br/>'
      );
    });
  });

  describe('Fetch Roles', () => {
    const roles = lodash.map([2, 3, 4, 5], id => ({
      id,
      title: faker.company.bsNoun,
      description: faker.company.catchPhrase
    }));
    it('should fetch all roles', (done) => {
      moxios.stubRequest('/api/v1/roles/', {
        status: 200,
        response: {
          roles
        }
      });

      const store = mockStore({});
      store.dispatch(usersActions.fetchAllRoles())
      .then(() => {
        expect(store.getActions()[0].type)
          .toEqual(actionTypes.FETCH_ROLES_REQUEST);
        expect(store.getActions()[1].payload)
          .toEqual(roles);
      });
      done();
    });

    it('should return error message when fetch fails', (done) => {
      moxios.stubRequest('/api/v1/roles/', {
        status: 500,
        response: {
          message: 'server error'
        }
      });

      const store = mockStore({});
      store.dispatch(usersActions.fetchAllRoles())
      .catch(() => {
        expect(store.getActions()[0].type)
          .toEqual(actionTypes.FETCH_ROLES_REQUEST);
        expect(store.getActions()[1].payload)
          .toEqual('server error');
      });
      done();
    });
  });

  describe('Delete Documents', () => {
    it('deletes a single document and returns success message', (done) => {
      moxios.stubRequest('api/v1/users/1', {
        status: 200,
        response: {
          message: 'user deleted successfully'
        }
      });

      const store = mockStore({});
      store.dispatch(usersActions.deleteUser(1))
      .then(() => {
        expect(store.getActions()[1].type)
        .toEqual(actionTypes.USER_DELETE_SUCCESSFUL);
        expect(store.getActions()[1].payload).toEqual(
          'user deleted successfully'
        );
      });
      done();
    });

    it('dispatches error when invalid user is requested deleted', (done) => {
      moxios.stubRequest('api/users/3000000', {
        status: 404,
        response: {
          message: 'user not found'
        }
      });
      const store = mockStore({});
      store.dispatch(usersActions.deleteUser(3000000, errorUser))
      .then(() => {
        expect(store.getActions()[1].type)
          .toEqual(actionTypes.DOCUMENT_DELETE_FAILED);
        expect(store.getActions()[1].payload).toEqual({
          message: 'user not found'
        });
      });
      done();
    });
  });

  describe('Search documents', () => {
    it('returns users if matching users are found', () => {
      const store = mockStore({});
      store.dispatch(usersActions.cancelUser());
      expect(store.getActions()[0].type)
      .toEqual(actionTypes.USER_CANCELLED);
    });
  });
});
