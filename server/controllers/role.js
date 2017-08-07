const Role = require('../models').Role;

module.exports = {
  create: (req, res) => {
    if (req.userId === 1) {
      Role
        .create({
          title: req.body.title,
          description: req.body.description
        })
        .then(role => res.status(201).send(role))
        .catch(error => res.status(400).send(error));
    } else {
      res.status(401).send({
        message: 'you are not authorized to create new roles'
      });
    }
  },
  list: (req, res) => {
    Role
      .findAll({
        where: {
          id: {
            $ne: 1
          }
        }
      })
      .then(roles => res.status(200).send(roles))
      .catch(error => res.status(400).send(error));
  }
};
