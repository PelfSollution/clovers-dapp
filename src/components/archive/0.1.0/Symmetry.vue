<template>
  <ul
    :class="{absolute:absolute, 'all-symmetries': horizontal}"
    class=" list-reset ">
    <li
      v-for="(sym, i) in symmetries"
      :key="i"
      :class="[sym, {'inline-block': horizontal}]"
      class="symmetry-type"/>
  </ul>
</template>

<script>
export default {
  name: 'Symmetry',
  props: {
    board: {
      type: Object,
      required: true
    },
    horizontal: {
      type: Boolean,
      default: true
    },
    absolute: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    symmetries () {
      let list = []
      let types = ['RotSym', 'Y0Sym', 'X0Sym', 'XYSym', 'XnYSym']
      for (let key in this.board) {
        if (types.includes(key) && this.board[key]) list.push(key)
      }
      // if (!list.length) {

      // }
      return list
    }
  }
}
</script>

<style lang="scss">
  .all-symmetries {
    left: 50%;
    margin-top: 2em;
    transform: translateX(-50%);
    text-align:center;
  }

  .symmetry-type {
    border-radius: 100%;
    border: 1px solid;
    line-height: 0;
    margin: .4em;
    padding: .8em;
    width:1em;
  }

  .XnYSym {
    background: linear-gradient(45deg, currentColor 1.1em, transparent 0);
  }

  .XYSym {
    background: linear-gradient(-45deg, currentColor 1.1em, transparent 0);
  }

  .Y0Sym {
    background: linear-gradient(0deg, currentColor .8em, transparent 0);
  }

  .X0Sym {
    background: linear-gradient(90deg, transparent .8em, currentColor 0);
  }

  .RotSym {
    position: relative;

    &:before {
      content: '\002938';
      font-weight: bold;
      left: .6em;
      line-height: 0;
      position: absolute;
      top: .7em;
    }
  }
</style>
