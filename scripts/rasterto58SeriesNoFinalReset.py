#!/usr/bin/perl
# CUPS filter wrapper for the GEZHI 58 mm printer.
#
# The vendor filter appends ESC @ after every page. On this printer that reset
# leaves the next queued page in a state where its first raster block is printed
# as text. Keep the vendor-generated 24-row raster blocks intact and drop only
# that trailing reset sequence.

use strict;
use warnings;

binmode STDOUT;
open my $vendor, "-|", "/usr/libexec/cups/filter/rasterto58Series", @ARGV
  or die "ERROR: could not start rasterto58Series: $!\n";
binmode $vendor;

local $/;
my $payload = <$vendor> // "";
close $vendor;
exit 1 if $? != 0;

if ($payload !~ s/\e\@\z//) {
  die "ERROR: vendor print stream did not end with ESC \@\n";
}

print $payload;
