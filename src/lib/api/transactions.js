import { supabase } from '../supabase'

/**
 * Get all transactions for the current user
 */
export const getTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get transactions for a specific date range
 */
export const getTransactionsByRange = async (startDate, endDate) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get transactions by type
 */
export const getTransactionsByType = async (type) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', type)
        .order('transaction_date', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get a single transaction by ID
 */
export const getTransaction = async (id) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Create a new transaction
 */
export const createTransaction = async (transaction) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an existing transaction
 */
export const updateTransaction = async (id, updates) => {
    const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete a transaction
 */
export const deleteTransaction = async (id) => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

    if (error) throw error
}

/**
 * Get financial summary
 */
export const getFinancialSummary = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')

    if (error) throw error

    const summary = data.reduce(
        (acc, transaction) => {
            if (transaction.type === 'income') {
                acc.totalIncome += Number(transaction.amount)
            } else {
                acc.totalExpenses += Number(transaction.amount)
            }
            return acc
        },
        { totalIncome: 0, totalExpenses: 0 }
    )

    summary.balance = summary.totalIncome - summary.totalExpenses

    return summary
}
