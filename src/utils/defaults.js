import { generateId } from './id'
import { DEFAULT_MANUFACTURERS } from './constants'

export function createDocConfirmation(name) {
  return {
    id: generateId('doc'),
    name,
    status: '未确认',
    confirmDate: '',
    note: '',
    file: null,
    fileFront: null,
    fileBack: null,
  }
}

export function createChipFirmware() {
  return {
    name: '',
    spec: '',
    file: null,
  }
}

export function createMaterialItem() {
  return {
    id: generateId('mat'),
    code: '',
    name: '',
    spec: '',
    required: 0,
    received: 0,
    shortage: 0,
    status: '',
    note: '',
    type: '贴片',
  }
}

export function createSubProject(name = '新子项目') {
  return {
    id: generateId('sub'),
    name,
    quantity: null,
    sampleStatus: '进行中',
    docConfirmations: [],
    chipFirmware: createChipFirmware(),
    materialStatus: {
      option: '备料中',
      note: '',
      file: null,
      items: [],
    },
    processRecords: [],
    problemNotes: [],
    shippingRecords: [],
    returnRecords: [],
    defectRecords: [],
  }
}

export function createOrder(name = '新订单') {
  return {
    id: generateId('order'),
    name,
    orderType: '小订单',
    quantity: 1,
    quantityUnit: '套',
    manufacturer: '',
    deliveryDate: '',
    status: '未下单',
    sampleInfo: {
      date: '',
      quantity: 0,
      result: '',
      image: null,
    },
    materialPrep: {
      option: '备料中',
      file: null,
      note: '',
      items: [],
    },
    subProjects: [],
  }
}

export function createDefaultState() {
  return {
    manufacturers: [...DEFAULT_MANUFACTURERS],
    orders: [],
  }
}

export function createProcessRecord() {
  return {
    id: generateId('proc'),
    date: new Date().toISOString().slice(0, 10),
    smtQty: 0,
    testQty: 0,
  }
}

export function createProblemNote() {
  return {
    id: generateId('prob'),
    date: new Date().toISOString().slice(0, 10),
    note: '',
    photos: [],
  }
}

export function createShippingRecord() {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: generateId('ship'),
    shipDate: today,
    quantity: 0,
    slipImage: null,
    note: '',
  }
}

export function createReturnRecord(overrides = {}) {
  return {
    id: generateId('return'),
    date: new Date().toISOString().slice(0, 10),
    quantity: 0,
    image: null,
    note: '',
    ...overrides,
  }
}

export function createDefectRecord() {
  return {
    id: generateId('def'),
    date: new Date().toISOString().slice(0, 10),
    defectQty: 0,
  }
}
