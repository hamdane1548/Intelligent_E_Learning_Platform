from pathlib import Path
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parent

def main() -> int:
    env = os.environ.copy()
    env['PYTHONDONTWRITEBYTECODE'] = '1'
    command = [
        sys.executable,
        '-m',
        'unittest',
        'discover',
        '-s',
        'tests',
        '-p',
        'test_api*.py',
        '-t',
        '.',
        '-v',
    ]
    return subprocess.call(command, cwd=ROOT, env=env)


if __name__ == '__main__':
    raise SystemExit(main())
