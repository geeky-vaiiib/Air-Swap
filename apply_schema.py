#!/usr/bin/env python3
"""
Apply Supabase schema using Python psycopg2
Handles DNS resolution and SSL connection
"""

import sys
import json
from datetime import datetime

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("Error: psycopg2 not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    import psycopg2
    from psycopg2 import sql

# Connection parameters
DB_CONFIG = {
    'host': 'db.fsavledncfmbrnhtiher.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'muggles2025',
    'sslmode': 'require'
}

def test_connection():
    """Test database connection"""
    try:
        print("Testing database connection...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print(f"✓ Connected successfully!")
        print(f"  PostgreSQL version: {version[:50]}...")
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

def apply_schema():
    """Apply the SQL schema file"""
    try:
        # Read SQL file
        print("\nReading schema file...")
        with open('supabase_schema_and_rls.sql', 'r') as f:
            sql_content = f.read()
        
        print(f"✓ Schema file loaded ({len(sql_content)} characters)")
        
        # Connect to database
        print("\nConnecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Execute SQL
        print("Executing schema...")
        statements_executed = 0
        errors = []
        warnings = []
        
        # Split by semicolon and execute each statement
        statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        total = len(statements)
        
        for i, statement in enumerate(statements, 1):
            if not statement or statement.startswith('--'):
                continue
            
            try:
                cur.execute(statement)
                statements_executed += 1
                print(f"  [{i}/{total}] ✓ Executed")
            except Exception as e:
                error_msg = f"Statement {i}: {str(e)[:100]}"
                errors.append(error_msg)
                print(f"  [{i}/{total}] ✗ Error: {str(e)[:80]}")
                
                # Check if it's a warning (already exists)
                if "already exists" in str(e).lower():
                    warnings.append(error_msg)
        
        cur.close()
        conn.close()
        
        # Generate report
        report = {
            "status": "done" if not errors or all("already exists" in e.lower() for e in errors) else "partial",
            "timestamp": datetime.now().isoformat(),
            "statements_executed": statements_executed,
            "total_statements": total,
            "warnings": warnings,
            "errors": [e for e in errors if "already exists" not in e.lower()]
        }
        
        # Save report
        with open('supabase-schema-apply-report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n{'='*60}")
        print(f"Schema Application Complete!")
        print(f"{'='*60}")
        print(f"Status: {report['status']}")
        print(f"Statements executed: {statements_executed}/{total}")
        print(f"Warnings: {len(warnings)}")
        print(f"Errors: {len(report['errors'])}")
        print(f"\nReport saved to: supabase-schema-apply-report.json")
        
        return report['status'] == 'done'
        
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        
        # Save error report
        error_report = {
            "status": "failed",
            "timestamp": datetime.now().isoformat(),
            "statements_executed": 0,
            "errors": [str(e)]
        }
        
        with open('supabase-schema-apply-report.json', 'w') as f:
            json.dump(error_report, f, indent=2)
        
        with open('.backup/supabase-schema-error.log', 'w') as f:
            f.write(f"Error applying schema: {e}\n")
            f.write(f"Timestamp: {datetime.now()}\n")
        
        return False

if __name__ == '__main__':
    print("="*60)
    print("Supabase Schema Application Script")
    print("="*60)
    
    # Test connection first
    if not test_connection():
        print("\n✗ Cannot connect to database. Please check:")
        print("  1. Network connectivity")
        print("  2. Hostname is correct")
        print("  3. Firewall settings")
        print("  4. Supabase project is active")
        sys.exit(1)
    
    # Apply schema
    success = apply_schema()
    
    sys.exit(0 if success else 1)

