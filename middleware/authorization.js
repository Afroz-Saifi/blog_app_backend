const authorization = ([roles]) => {
  return async (req, res, next) => {
    const { role } = req.user;
    if (roles.includes(role)) {
      next();
    } else {
      return res
        .status(400)
        .json({ msg: "you are not authorized for this route" });
    }
  };
};

module.exports = { authorization };
