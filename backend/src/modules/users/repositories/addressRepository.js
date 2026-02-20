const Address = require('../../../models/Address');
const { withDbRetry } = require('../../../utils/dbRetry');

const formatSingleLineAddress = (addressDoc) => {
  if (!addressDoc) return '';

  return [
    addressDoc.line1,
    addressDoc.line2,
    addressDoc.city,
    addressDoc.state,
    addressDoc.postalCode,
    addressDoc.country
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ');
};

const addressRepository = {
  findDefaultByUserId(userId, options = {}) {
    const { session = null, lean = false } = options;
    const operation = () => {
      const query = Address.findOne(
        { userId, isDeleted: false, isDefault: true, isActive: true },
        null,
        session ? { session } : {}
      ).sort({ updatedAt: -1 });

      return lean ? query.lean() : query;
    };

    if (session) {
      return operation();
    }

    return withDbRetry(operation, { context: 'address.findDefaultByUserId' });
  },

  findByUserId(userId, options = {}) {
    const { session = null, lean = false } = options;
    const operation = () => {
      const query = Address.find(
        { userId, isDeleted: false, isActive: true },
        null,
        session ? { session } : {}
      ).sort({ isDefault: -1, createdAt: -1 });

      return lean ? query.lean() : query;
    };

    if (session) {
      return operation();
    }

    return withDbRetry(operation, { context: 'address.findByUserId' });
  },

  async upsertDefaultFromString(userId, addressLine, options = {}) {
    const { session = null, name = '' } = options;
    const trimmed = String(addressLine || '').trim();

    if (!trimmed) {
      return null;
    }

    const existingDefault = await this.findDefaultByUserId(userId, { session, lean: false });
    if (existingDefault) {
      existingDefault.line1 = trimmed;
      if (name) {
        existingDefault.name = name;
      }
      return existingDefault.save();
    }

    const updateOptions = session ? { session } : {};
    await Address.updateMany(
      { userId, isDeleted: false },
      { $set: { isDefault: false } },
      updateOptions
    );

    try {
      return await Address.create(
        [
          {
            userId,
            label: 'Primary',
            name: name || '',
            line1: trimmed,
            country: 'USA',
            isDefault: true,
            isActive: true,
            isDeleted: false
          }
        ],
        updateOptions
      ).then(([doc]) => doc);
    } catch (error) {
      if (error?.code === 11000) {
        return this.findDefaultByUserId(userId, { session });
      }
      throw error;
    }
  },

  formatSingleLineAddress
};

module.exports = {
  addressRepository,
  formatSingleLineAddress
};
