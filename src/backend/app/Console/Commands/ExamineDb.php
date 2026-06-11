<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ExamineDb extends Command
{
    protected $signature = 'db:examine';
    protected $description = 'Examine DB schema';

    public function handle()
    {
        $this->info("Mitra columns:");
        $columns = Schema::getColumnListing('mitra');
        $this->line(implode(', ', $columns));

        $this->info("Layanan columns:");
        $columns = Schema::getColumnListing('layanan');
        $this->line(implode(', ', $columns));

        $this->info("Sample mitra:");
        $mitra = DB::table('mitra')->first();
        $this->line(json_encode($mitra, JSON_PRETTY_PRINT));
        
        $this->info("Sample layanan:");
        $layanan = DB::table('layanan')->first();
        $this->line(json_encode($layanan, JSON_PRETTY_PRINT));
    }
}
