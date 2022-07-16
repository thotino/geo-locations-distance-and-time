const Joi = require('joi')

const schema = Joi.object({
  start: Joi.object({
    lat: Joi.number().required().min(-90).max(90),
    lng: Joi.number().required().min(-180).max(180)
  }).required(),
  end: Joi.object({
    lat: Joi.number().required().min(-90).max(90),
    lng: Joi.number().required().min(-180).max(180)
  }).required(),
  units: Joi.string().optional().allow('metric', 'imperial')
})

const verifyRequest = (req, res, next) => {
  try {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({ error })
    }
    next()
  } catch (error) {
    return Promise.reject(error)
  }
}

module.exports = { verifyRequest }
