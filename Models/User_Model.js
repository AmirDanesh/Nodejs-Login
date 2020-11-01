const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const schema = mongoose.Schema;
const dotenv = require('dotenv');
dotenv.config();
const UserSchema = new schema({
    NormaliziedUsername: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    FirstName: { type: String, required: true, trim: true },
    LastName: { type: String, required: true, trim: true },
    PhoneNumber: { type: String, required: true, trim: true },
    PhoneNumberConfirm: { type: Boolean, required: true, default: false },
    Email: { type: String, trim: true },
    EmailConfirm: { type: Boolean, default: false },
    PasswordHash: { type: String, required: true, trim: true },
    LockedOut: { type: Boolean, default: false },
    LockUntilTime: { type: Date, default: null },
    PasswordFailureCount: { type: Number, default: 0 },
    ConcurrencyStamp: { type: String }
});

UserSchema.pre('save', function (next) {
    let user = this;
    if (this.isModified('PasswordHash') || this.isNew) {
        bcrypt.genSalt(Math.floor(Math.random() * 10) + 1, (err, salt) => {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.PasswordHash, salt, (err, hash) => {
                if (err) {
                    return next(err);
                }
                user.PasswordHash = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.ComparePassword = function (password, next) {
    let user = this;
    return bcrypt.compareSync(password, user.PasswordHash);
};

module.exports = mongoose.model('User', UserSchema);
