import {
  ADD,
  MINUS,
  SETNUM
} from '../constants/counter'

export const add = () => {
  return {
    type: ADD
  }
}
export const minus = () => {
  return {
    type: MINUS
  }
}

// 异步的action
export function asyncAdd () {
  return dispatch => {
    setTimeout(() => {
      dispatch(add())
    }, 2000)
  }
}

export const setnum = (num) => {
  return {
    type: SETNUM,
    num,
  }
}
