const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/db.json");

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

class Query {
  constructor(data, modelMap) {
    this.data = data;
    this.modelMap = modelMap;
  }

  populate(field) {
    if (!field) return this;

    const model = this.modelMap[field];
    if (!model) return this;

    const db = readDB();

    if (Array.isArray(this.data)) {
      this.data = this.data.map(item => {
        const ref = db[model.collection].find(
          r => r._id == item[field]
        );
        return { ...item, [field]: ref || null };
      });
    } else {
      const ref = db[model.collection].find(
        r => r._id == this.data[field]
      );
      this.data = { ...this.data, [field]: ref || null };
    }

    return this;
  }

  exec() {
    return this.data;
  }

  then(resolve) {
    return Promise.resolve(this.data).then(resolve);
  }
}

class BaseModel {
  static read() {
    return readDB();
  }

  static write(data) {
    writeDB(data);
  }

  static find(filter = {}) {
    const db = this.read();
    const items = (db[this.collection] || []).filter(item =>
      Object.keys(filter).every(key => item[key] == filter[key])
    );

    return new Query(items, this.modelMap);
  }

  static findOne(filter = {}) {
    const db = this.read();
    const item = (db[this.collection] || []).find(item =>
      Object.keys(filter).every(key => item[key] == filter[key])
    );

    return new Query(item || null, this.modelMap);
  }

  static findById(id) {
    const db = this.read();
    const item = (db[this.collection] || []).find(
      item => item._id == id
    );

    return new Query(item || null, this.modelMap);
  }

  static findOneAndDelete(filter = {}) {
    const db = this.read();
    const items = db[this.collection] || [];

    const index = items.findIndex(item =>
      Object.keys(filter).every(key => item[key] == filter[key])
    );

    if (index === -1) return new Query(null, this.modelMap);

    const deleted = items.splice(index, 1)[0];
    this.write(db);

    return new Query(deleted, this.modelMap);
  }

  static findOneAndUpdate(filter = {}, update = {}) {
    const db = this.read();
    const items = db[this.collection] || [];

    const item = items.find(item =>
      Object.keys(filter).every(key => item[key] == filter[key])
    );

    if (!item) return new Query(null, this.modelMap);

    Object.assign(item, update, { updatedAt: new Date() });
    this.write(db);

    return new Query(item, this.modelMap);
  }

  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    const db = this.constructor.read();
    db[this.constructor.collection] =
      db[this.constructor.collection] || [];

    if (!this._id) {
      this._id = Date.now().toString();
      this.createdAt = new Date();
    }

    this.updatedAt = new Date();

    db[this.constructor.collection].push(this);
    this.constructor.write(db);

    return new Query(this, this.constructor.modelMap);
  }
}

module.exports = BaseModel;