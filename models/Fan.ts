import mongoose from 'mongoose';

const FanSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: {
    type: String,
    required: false,
    validate: {
      validator: function(v: string) {
        // Permite campo vacío o nulo, pero si se proporciona, valida el formato.
        if (!v) return true;
        // Expresión regular para 9 dígitos que empiezan por 6, 7, 8 o 9.
        return /^[6-9]\d{8}$/.test(v);
      },
      message: (props: { value: string }) => `${props.value} no es un número de teléfono español válido.`
    }
  },
  categoria: {
    type: String,
    enum: ['Tercera', 'Sub 23', 'División de honor'],
    required: false
  },
  tokenUsed: {
    type: String,
    required: false,
    index: true
  },
  lastAccess: { type: Date, default: null },
  lastEntry: { type: Date, default: null },
  lastExit: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Fan || mongoose.model('Fan', FanSchema);
