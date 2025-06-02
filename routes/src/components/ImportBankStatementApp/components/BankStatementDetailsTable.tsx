import React, { useState } from "react";
import {
  ColumnDef,
  HeaderGroup,
  Header,
  Row,
  useReactTable,
  getCoreRowModel,
  flexRender,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Transaction } from "../ImportBankStatement.types";
import importBankStatementStore from "../ImportBankStatement.store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, EllipsisVertical } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input, CurrencyInput } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "@tanstack/react-router";

const BankStatementDetailsTable: React.FC<{
  withImportStatementsButton?: boolean;
}> = ({ withImportStatementsButton = false }) => {
  const { toast } = useToast();
  // prefer state over store row selection state
  // https://tanstack.com/table/latest/docs/guide/row-selection
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const statement = importBankStatementStore((state) => state.statement);
  const adjustTransaction = importBankStatementStore(
    (state) => state.adjustTransaction
  );
  const mergeStatement = importBankStatementStore(
    (state) => state.mergeStatement
  );
  const statement_copy = importBankStatementStore(
    (state) => state.statement_copy
  );
  const resetStatementCopy = importBankStatementStore(
    (state) => state.resetStatementCopy
  );

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          color="green"
          name="select-all"
          checked={table.getIsAllRowsSelected()}
          onChange={(checked) => table.toggleAllRowsSelected(checked)}
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            color="green"
            name={`select-${row.id}`}
            checked={row.getIsSelected()}
            onChange={(checked) => {
              row.toggleSelected(checked);
            }}
          />
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row, getValue }) => {
        return isEditing ? (
          <DatePicker
            date={getValue() as Date}
            setDate={(date) => {
              adjustTransaction({
                ...row.original,
                date: date.toISOString(),
              });
            }}
          />
        ) : (
          <span>{format(getValue() as string, "PPP")}</span>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row, getValue }) => {
        return isEditing ? (
          <Input
            className="w-full px-2 py-1 border rounded"
            defaultValue={getValue() as string}
            onBlur={(e) => {
              adjustTransaction({
                ...row.original,
                description: e.target.value,
              });
            }}
          />
        ) : (
          <span className="text-left">{getValue() as string}</span>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row, getValue }) => {
        const defaultValue = Math.abs(getValue() as number).toFixed(2);

        return isEditing ? (
          <CurrencyInput
            defaultValue={defaultValue}
            onBlur={(e) => {
              const amount = Math.abs(
                parseFloat(e.target.value.replace("$", ""))
              ).toFixed(2);
              adjustTransaction({
                ...row.original,
                amount: parseFloat(amount),
              });
            }}
            decimalSeparator="."
            groupSeparator=","
            decimalScale={2}
            decimalsLimit={2}
          />
        ) : (
          <span className="text-right">
            <span>$</span>
            <span>{defaultValue}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row, getValue }) => {
        return isEditing ? (
          <Select
            onValueChange={(value) => {
              console.log("onValueChange", value);
              adjustTransaction({
                ...row.original,
                type: value as "credit" | "debit",
              });
            }}
            defaultValue={getValue() as string}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="credit">credit</SelectItem>
                <SelectItem value="debit">debit</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <span
            className={`px-2 py-1 rounded text-xs ${
              getValue() === "credit"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {getValue() as string}
          </span>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row, getValue }) => {
        return isEditing ? (
          <Button variant="ghost" onClick={() => setFocusedRow(null)}>
            Save
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setFocusedRow(row.id)}>
            <EllipsisVertical className="w-4 h-4" />
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: isEditing /* We modify the statement copy, when the user saves we replace the statement with the copy */
      ? statement_copy?.transactions || []
      : statement?.transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection as OnChangeFn<RowSelectionState>,
  });

  const handleSave = () => {
    const transactions = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    fetch("/api/v1/pdf/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactions }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
          });
        } else if (data.message) {
          toast({
            title: data.message,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleMergeTransactions = () => {
    mergeStatement();
    resetStatementCopy();
    setIsEditing(false);
  };

  if (!statement_copy) return null;

  return (
    <div className="mt-6">
      <div className="flex justify-end gap-4">
        {withImportStatementsButton && (
          <Link
            href="/app/transactions/new"
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            Import Statements
          </Link>
        )}
        {isEditing ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Save Edits</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will save your changes to the transactions. Please
                  confirm that you want to proceed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancel}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleMergeTransactions}>
                  Yes, merge transactions
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="outline" onClick={handleEdit}>
            Modify Transactions
          </Button>
        )}
      </div>
      <div className="bg-white shadow-md my-10">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              {table
                .getHeaderGroups()
                .map((headerGroup: HeaderGroup<Transaction>) => (
                  <tr key={headerGroup.id} className="bg-gray-100">
                    {headerGroup.headers.map(
                      (header: Header<Transaction, unknown>, index) => (
                        <th
                          key={header.id}
                          className={cn("px-4 py-2", {
                            "text-left": [0, 1, 2].includes(index),
                            "text-right": [3, 4, 5].includes(index),
                          })}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      )
                    )}
                  </tr>
                ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row: Row<Transaction>) => (
                <tr
                  key={row.id}
                  className={cn(
                    row.index % 2 === 0 ? "bg-gray-50" : "",
                    focusedRow !== row.id && "hover:bg-gray-100 cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={cn("px-4 py-2", {
                        "text-left": [0, 1, 2].includes(index),
                        "text-right": [3, 4, 5].includes(index),
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            const rows = table.getRowModel().rows;
            const data = rows.map((row) => {
              return {
                date: row.original.date,
                description: row.original.description,
                amount: row.original.amount,
                type: row.original.type,
              };
            });

            // Add header row
            const header = "Date,Description,Amount,Type\n";
            const csvRows = data
              .map((row) => {
                // Escape commas in description if present
                const escapedDescription = row.description.includes(",")
                  ? `"${row.description}"`
                  : row.description;
                return `${row.date},${escapedDescription},${row.amount},${row.type}`;
              })
              .join("\n"); // Join rows with newline

            const csv = header + csvRows;

            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "transactions.csv";
            a.click();
          }}
        >
          Export as CSV
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!table.getRowCount() || isEditing}
        >
          Store Transactions
        </Button>
      </div>
    </div>
  );
};

export default BankStatementDetailsTable;

export function DatePicker({
  date,
  setDate,
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && setDate(date as Date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
