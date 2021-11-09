<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidModeException;

class AutocompleteElement extends AbstractElement
{
    public const MODE_SINGLE = 'single';
    public const MODE_MULTIPLE = 'multiple';

    public const MODES = [
        self::MODE_SINGLE,
        self::MODE_MULTIPLE,
    ];

    private string $route;
    private string $parameter;
    private string $mode;
    private bool $required;

    public function __construct(
        string $name,
        string $route,
        string $mode = self::MODE_SINGLE,
        bool $required = true
    ) {
        if (!\in_array($mode, static::MODES, true)) {
            throw new InvalidModeException($name, $mode, static::MODES);
        }

        $this->name = $name;
        $this->route = $route;
        $this->parameter = 'query';
        $this->mode = $mode;
        $this->required = $required;
    }

    public function setParameter(string $parameter): self
    {
        $this->parameter = $parameter;

        return $this;
    }

    protected function getType(): string
    {
        return 'autocomplete';
    }

    protected function renderElement($value): array
    {
        if (null !== $value) {
            $value = (array)$value;
        }

        return [
            'route' => $this->route,
            'parameter' => $this->parameter,
            'mode' => $this->mode,
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
