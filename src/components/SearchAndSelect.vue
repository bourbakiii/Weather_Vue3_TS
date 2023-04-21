<template>
    <div class="search-and-select">
        <input v-bind="{ placeholder: $attrs.placeholder }" :value="$attrs.modelValue" @input="updateModelValue" type="text"
            class="search-and-select__input" />
        <div class='search-and-select__options'>
            <button @mousedown="selectCity(item)" v-for="item in $props.options"
                class="search-and-select-option option">
                {{ item.name }}
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.search-and-select {
    position: relative;

    &__options {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        display: flex;
        align-items: stretch;
        justify-content: flex-start;
        flex-direction: column;
        background-color: white;
        gap: 3px;
        padding: 5px 0;
        visibility: hidden;
    }
}

input {
    width: 100%;
    border: none;
    border: 1px solid black;
    border-radius: 5px;
    padding: 5px;
    outline: none;
    transition: 0.25s;

    &::placeholder {
        transition: 0.25s;
    }

    &:focus {
        &::placeholder {
            opacity: 0;
        }

        padding: 5px 8px;
    }
}

.option {
    cursor: pointer;
    border: none;
    background-color: transparent;
    padding: 5px;
    text-align: left;
    border-radius: 5px;

    &:hover {
        background-color: rgba(0, 0, 0, .1);
    }
}

input:focus~.search-and-select__options {
    visibility: visible;
}
</style>


<script setup lang="ts">
import { PropType } from 'vue';
import { City } from '../types';
const emit = defineEmits(['update:modelValue', 'select'])
const updateModelValue = ({ target: { value = null } }) => emit('update:modelValue', value);
const selectCity = (item:City) => emit('select', item);
defineProps({
    options: {
        required: true,
        type: Object as PropType<City[]>
    }
});
// function selectOption(item: City) {
//     module
// }
</script>