import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor?: (item: T, index: number) => string;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  filterKey?: keyof T;
  filterOptions?: string[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptySubtitle?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchFields = [],
  filterKey,
  filterOptions = [],
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No records found',
  emptySubtitle = 'There are currently no items matching your criteria.'
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let list = [...data];

    // Filter by key
    if (filterKey && selectedFilter !== 'ALL') {
      list = list.filter((item) => String(item[filterKey]) === selectedFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        if (searchFields.length > 0) {
          return searchFields.some((f) => String(item[f] || '').toLowerCase().includes(q));
        }
        return Object.values(item).some((v) => String(v || '').toLowerCase().includes(q));
      });
    }

    // Sort
    if (sortKey) {
      list.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return list;
  }, [data, filterKey, selectedFilter, searchQuery, searchFields, sortKey, sortDirection]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getItemKey = (item: T, idx: number): string => {
    if (keyExtractor) return keyExtractor(item, idx);
    return (
      item.id ||
      item.key ||
      item.patient_id ||
      item.appointment_id ||
      item.report_id ||
      item.claim_id ||
      item.policy_id ||
      item.parameter ||
      String(idx)
    );
  };

  return (
    <div className="datatable-container">
      {/* Top Filter Bar */}
      <div className="datatable-toolbar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        marginBottom: '0.75rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: 260, flex: 1, maxWidth: 420 }}>
          <Search style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 14,
            height: 14,
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            className="input-ui"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ paddingLeft: '2.1rem', fontSize: '0.8rem', height: 34 }}
          />
        </div>

        {/* Filter Pills */}
        {filterOptions.length > 0 && filterKey && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
              <Filter style={{ width: 12, height: 12 }} /> Filter:
            </span>
            {['ALL', ...filterOptions].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelectedFilter(opt);
                  setCurrentPage(1);
                }}
                className={`filter-pill ${selectedFilter === opt ? 'active' : ''}`}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 14,
                  border: '1px solid var(--border-subtle)',
                  background: selectedFilter === opt ? 'var(--forest-brand)' : 'transparent',
                  color: selectedFilter === opt ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: selectedFilter === opt ? 600 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
        <table className="table-ui" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown style={{
                        width: 12,
                        height: 12,
                        color: sortKey === col.key ? 'var(--forest-brand)' : 'var(--text-muted)',
                        opacity: sortKey === col.key ? 1 : 0.4
                      }} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr
                  key={getItemKey(item, idx)}
                  onClick={() => onRowClick && onRowClick(item)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item) : item[col.key] != null ? String(item[col.key]) : '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                  <div style={{ maxWidth: 360, margin: '0 auto' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {emptyMessage}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {emptySubtitle}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-ui btn-secondary-ui"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} /> Previous
            </button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-ui btn-secondary-ui"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              Next <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
