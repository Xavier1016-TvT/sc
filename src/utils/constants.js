export const STORAGE_KEY = 'production-dashboard-data'

/** CloudBase 环境 ID */
export const CLOUDBASE_ENV_ID = 'ordprod-d4gqvf6i8e862d191'

/** 文档库集合与全局状态文档 ID（多端共享同一份） */
export const CLOUD_COLLECTION = 'production_dashboard'
export const CLOUD_STATE_DOC_ID = 'global_state'

export const ORDER_STATUSES = ['未下单', '生产中', '已结单']

export const ORDER_TYPES = ['小订单', '大订单']

export const ORDER_UNITS = ['套', '个']

export const SAMPLE_STATUSES = ['通过', '未通过', '进行中']

export const CONFIRM_STATUSES = ['已确认', '未确认']

export const MATERIAL_OPTIONS = ['备料中', '料齐']

export const MATERIAL_TYPES = ['贴片', 'PCB', '配件']

export const DEFAULT_MANUFACTURERS = ['重庆', '浙江立为', '睿思凯', '博睿通']

export const DEFAULT_DOC_ITEMS = ['钢网', 'BOM表', '生产标准', '首件确认']

export const MATERIAL_HEADERS = [
  '编码',
  '物料名称',
  '规格',
  '需求量',
  '实到数',
  '缺料数',
  '物料状态',
  '备注',
  '物料类型',
]
