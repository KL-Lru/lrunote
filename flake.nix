{
  description = "Node.js environments";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    systems.url = "github:nix-systems/default";

    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        lib = pkgs.lib;

        nodeVersion = builtins.head (
          lib.strings.splitString "." (lib.strings.trim (builtins.readFile ./.node-version))
        );
        nodejs = pkgs."nodejs_${nodeVersion}";

        corepack = pkgs.stdenv.mkDerivation {
          name = "corepack";
          buildInputs = [ nodejs ];
          phases = [ "installPhase" ];
          installPhase = ''
            mkdir -p $out/bin
            corepack enable --install-directory=$out/bin
          '';
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            nodejs
            corepack
          ];
        };
      }
    );
}
