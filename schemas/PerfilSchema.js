const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  race: { type: String, default: "A escolher" },
  classe: { type: String, default: "A escolher" },
  faction: { type: String, default: "A escolher" },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  pontos: { type: Number, default: 0 },
  vida: { type: Number, default: 20 },
  força: { type: Number, default: 1 },
  destreza: { type: Number, default: 1 },
  energia: { type: Number, default: 10},
  lesmas: [{
        nome: { type: String },
        poder: { type: Number },
        habilidade: { type: String },
        elemento: { type: String },
        vida: { type: Number },
        defesa: { type: Number },
        fraqueza: { type: String },
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        happiness: { type: Number, default: 0 }
  }],
  inventario: [{
        nome: { type: String },
        quantidade: { type: Number },
  }],
  shooter: [{
        nome: { type: String },
        descrição: { type: String },
  }],
  money: { type: Number },
  bank: { type: Number, default: 0 },
  cavernaAtual: { type: Number, default: 1 },
  ultimoExplorar: { type: Date, default: Date.now },
});

module.exports = model("PerfilSchema", userSchema);