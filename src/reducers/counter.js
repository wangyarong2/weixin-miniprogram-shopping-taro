import { ADD, MINUS, SETNUM } from '../constants/counter'

const INITIAL_STATE = {
  num: 0
}

export default function counters (state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD:
      return {
        ...state,
        num: state.num + 1
      }
     case MINUS:
       return {
         ...state,
         num: state.num - 1
       }
      case SETNUM:
        return {
          ...state,
          num: action.num
        }
     default:
       return state
  }
}
