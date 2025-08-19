<script>
  import { createEventDispatcher } from 'svelte';

  /**
   * 시즌 선택 컴포넌트
   * @description 사용 가능한 시즌 목록을 드롭다운으로 표시하고 선택된 시즌을 부모로 전달
   */

  export let seasons = [];
  export let selected = '';

  const dispatch = createEventDispatcher();

  /**
   * 시즌 선택 시 실행되는 핸들러
   * @param {Event} event - 선택 이벤트
   * @returns {void}
   */
  const handleSeasonChange = (event) => {
    const newSeason = event.target.value;
    selected = newSeason;
    dispatch('change', newSeason);
  };
</script>

<div class="season-selector">
  <label for="season-select" class="block text-sm font-medium text-gray-700 mb-2">
    📅 시즌 선택
  </label>
  <select
    id="season-select"
    bind:value={selected}
    on:change={handleSeasonChange}
    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-mavs-blue focus:border-mavs-blue bg-white"
  >
    {#each seasons as season}
      <option value={season}>{season} 시즌</option>
    {/each}
  </select>
</div>

<style>
  .season-selector select {
    min-width: 150px;
    transition: all 0.2s ease-in-out;
  }

  .season-selector select:hover {
    border-color: #cbd5e0;
  }

  .season-selector select:focus {
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }

  .season-selector select option {
    padding: 8px;
  }
</style>